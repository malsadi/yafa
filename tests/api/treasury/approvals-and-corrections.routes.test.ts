import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AccountRecord, EntryRecord } from '../../../src/shared/treasury/treasury-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  colleagueOf,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from './treasury-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TPNV';
const ENTER = [
  'treasury.accounts.read',
  'treasury.accounts.manage',
  'treasury.credit.create',
  'treasury.debit.create',
  'treasury.debit.approve',
  'treasury.entries.correct',
];
let treasurer: Officer;
let approver: Officer;
let bank = '';

const base = () => unitPath(treasurer.unitId);
const as = (o: Officer, method: string, path: string, body?: object) =>
  call(o.clerkUserId, method, `${base()}${path}`, body);
const balance = async () =>
  (
    await (
      await as(treasurer, 'GET', `/accounts/${bank}/entries`)
    ).json<{ account: AccountRecord; entries: EntryRecord[] }>()
  ).account.balancePence;
async function bigDebit(amountPence = 90000): Promise<string> {
  const res = await as(treasurer, 'POST', '/debits', {
    accountId: bank,
    amountPence,
    entryDate: '2026-07-01',
    counterparty: 'Printer',
    description: 'Flyers',
  });
  return (await res.json<{ entryId: string }>()).entryId;
}

describe('payment approval (brief 17 B5; 7.3; P7; D-124, D-133)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    treasurer = await treasuryOfficer({ suffix: 'TP1', notice: NOTICE, capabilities: ENTER });
    approver = await colleagueOf(treasurer, {
      suffix: 'TP2',
      notice: NOTICE,
      capabilities: ['treasury.accounts.read', 'treasury.debit.approve'],
    });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 50000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    bank = await openAccount(treasurer, 'Bank', 100000);
  });

  it('lists what awaits approval, and a second officer approves it, so it counts', async () => {
    const id = await bigDebit();
    expect(
      (await (await as(approver, 'GET', '/approvals')).json<EntryRecord[]>()).map((e) => e.id),
    ).toEqual([id]);
    expect(await balance()).toBe(100000);
    expect((await as(approver, 'POST', `/entries/${id}/approve`, {})).status).toBe(200);
    expect(await balance()).toBe(10000);
    expect((await as(approver, 'POST', `/entries/${id}/approve`, {})).status).toBe(409);
  });

  it('never lets the officer who entered it decide it — in the service or the database', async () => {
    const id = await bigDebit();
    const self = await as(treasurer, 'POST', `/entries/${id}/approve`, {});
    expect(self.status).toBe(403);
    expect(await self.json()).toMatchObject({ error: { code: 'treasury.self-approval' } });
    await expect(
      env.DB.prepare(
        "UPDATE treasury_entries SET approval_status = 'Approved', decided_by = created_by, decided_at = 'now' WHERE id = ?",
      )
        .bind(id)
        .run(),
    ).rejects.toThrow(/self-approval/);
  });

  it('keeps a declined debit in the history, with who declined it and why, not counting it', async () => {
    const id = await bigDebit();
    expect((await as(approver, 'POST', `/entries/${id}/decline`, { reason: '' })).status).toBe(400);
    expect(
      (await as(approver, 'POST', `/entries/${id}/decline`, { reason: 'Not agreed' })).status,
    ).toBe(200);
    const { entries } = await (
      await as(treasurer, 'GET', `/accounts/${bank}/entries`)
    ).json<{ entries: EntryRecord[] }>();
    expect(entries.find((e) => e.id === id)).toMatchObject({
      approvalStatus: 'Declined',
      declineReason: 'Not agreed',
      decidedByName: 'Fictional Person',
    });
    expect(await balance()).toBe(10000);
  });
});

describe('corrections (brief 17 B6; D-126)', () => {
  it('undoes a counted entry with a reversal dated today, needing no approval whatever its size', async () => {
    const credit = await as(treasurer, 'POST', '/credits', {
      accountId: bank,
      amountPence: 900000,
      entryDate: '2026-07-02',
      counterparty: 'Grant',
      description: 'Wrong amount',
    });
    const { entryId } = await credit.json<{ entryId: string }>();
    expect(await balance()).toBe(910000);
    const reversal = await as(treasurer, 'POST', `/entries/${entryId}/reverse`, {
      description: 'Typed wrongly',
    });
    expect(await reversal.json()).toMatchObject({ approvalStatus: 'Not needed' });
    expect(await balance()).toBe(10000);
    const { entries } = await (
      await as(treasurer, 'GET', `/accounts/${bank}/entries`)
    ).json<{ entries: EntryRecord[] }>();
    const original = entries.find((e) => e.id === entryId);
    const undo = entries.find((e) => e.reversesEntryId === entryId);
    expect(undo).toMatchObject({
      type: 'debit',
      amountPence: 900000,
      counterparty: 'Grant',
      description: 'Typed wrongly',
    });
    expect(original?.reversedByEntryId).toBe(undo?.id);
  });

  it('reverses an entry once, never a reversal, and never an entry that does not count', async () => {
    const { entries } = await (
      await as(treasurer, 'GET', `/accounts/${bank}/entries`)
    ).json<{ entries: EntryRecord[] }>();
    const reversed = entries.find((e) => e.reversedByEntryId);
    const reversal = entries.find((e) => e.reversesEntryId);
    const declined = entries.find((e) => e.approvalStatus === 'Declined');
    const code = async (id: string) =>
      (
        await (
          await as(treasurer, 'POST', `/entries/${id}/reverse`, {})
        ).json<{ error: { code: string } }>()
      ).error.code;
    expect(await code(reversed?.id ?? '')).toBe('treasury.already-reversed');
    expect(await code(reversal?.id ?? '')).toBe('treasury.reversal-not-reversed');
    expect(await code(declined?.id ?? '')).toBe('treasury.not-counted');
  });
});
