import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AccountRecord, EntryRecord } from '../../../src/shared/treasury/treasury-records';
import { setDocumentFileRules } from '../documents-archive/archive-fixtures';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { setSetting } from '../../../src/worker/core/settings';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from './treasury-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TENV';
let treasurer: Officer;
let bank = '';
let cash = '';

const base = () => unitPath(treasurer.unitId);
const post = (path: string, body: object) =>
  call(treasurer.clerkUserId, 'POST', `${base()}${path}`, body);
const history = async (accountId: string) =>
  (await call(treasurer.clerkUserId, 'GET', `${base()}/accounts/${accountId}/entries`)).json<{
    account: AccountRecord;
    entries: EntryRecord[];
  }>();
const debit = (amountPence: number, extra: object = {}) =>
  post('/debits', {
    accountId: bank,
    amountPence,
    entryDate: '2026-06-01',
    counterparty: 'Hall',
    description: 'Hire',
    ...extra,
  });

describe('credits, debits and transfers (brief 17 B1 to B5; P7; D-120 to D-123)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    treasurer = await treasuryOfficer({
      suffix: 'TE1',
      notice: NOTICE,
      capabilities: [
        'treasury.accounts.read',
        'treasury.accounts.manage',
        'treasury.credit.create',
        'treasury.debit.create',
        'treasury.transfer.create',
      ],
    });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 50000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    bank = await openAccount(treasurer, 'Bank', 100000);
    cash = await openAccount(treasurer, 'Cash', 0);
  });

  it('counts a credit and a debit at or below the threshold at once, warning of a missing receipt', async () => {
    const credit = await post('/credits', {
      accountId: bank,
      amountPence: 2500,
      entryDate: '2026-06-01',
      counterparty: 'Raffle',
      description: 'Takings',
    });
    expect(await credit.json()).toMatchObject({
      approvalStatus: 'Not needed',
      warnings: [{ code: 'no-receipt' }],
    });
    expect(await (await debit(50000)).json()).toMatchObject({ approvalStatus: 'Not needed' });
    expect((await history(bank)).account.balancePence).toBe(52500);
  });

  it('holds a debit or transfer above the threshold as Awaiting approval, moving nothing (P7, D-122)', async () => {
    expect(await (await debit(50001)).json()).toMatchObject({
      approvalStatus: 'Awaiting approval',
    });
    const transfer = await post('/transfers', {
      accountId: bank,
      toAccountId: cash,
      amountPence: 60000,
      entryDate: '2026-06-02',
      description: 'Float',
    });
    expect(await transfer.json()).toMatchObject({ approvalStatus: 'Awaiting approval' });
    const { account, entries } = await history(bank);
    expect(account).toMatchObject({ balancePence: 52500, awaitingCount: 2 });
    expect(entries.filter((e) => e.approvalStatus === 'Awaiting approval')).toHaveLength(2);
  });

  it('moves money between two accounts in one record, and warns when one goes below zero (D-120)', async () => {
    const res = await post('/transfers', {
      accountId: cash,
      toAccountId: bank,
      amountPence: 1000,
      entryDate: '2026-06-03',
      description: 'Back',
    });
    expect(await res.json()).toMatchObject({
      approvalStatus: 'Not needed',
      warnings: [{ code: 'below-zero', accountId: cash, balancePence: -1000 }],
    });
    expect((await history(cash)).account.balancePence).toBe(-1000);
    expect((await history(bank)).account.balancePence).toBe(53500);
  });

  it('refuses a future date, and a budget line on a branch account (D-121; P10)', async () => {
    expect(await (await debit(10, { entryDate: '2999-01-01' })).json()).toMatchObject({
      error: { code: 'treasury.future-date' },
    });
    expect(await (await debit(10, { budgetLineId: 'nope' })).json()).toMatchObject({
      error: { code: 'treasury.budget-line-not-of-account' },
    });
  });

  it('refuses a credit or debit without a receipt once one is required, and keeps the receipts given (B4; D-123)', async () => {
    await setSetting(env.DB, {
      key: 'treasury.receipt_required',
      value: true,
      actorPersonId: treasurer.personId,
    });
    expect(await (await debit(10)).json()).toMatchObject({
      error: { code: 'treasury.receipt-required' },
    });
    await setDocumentFileRules(treasurer.personId);
    for (const [key, value] of [
      ['administration-panel.file_types_receipt_photos', ['image/jpeg']],
      ['administration-panel.file_size_limit_receipt_photos_mb', 5],
    ] as const) {
      await setSetting(env.DB, { key, value, actorPersonId: treasurer.personId });
    }
    const started = await (
      await post('/debits/receipts/uploads', {
        fileName: 'r.jpg',
        size: 3,
        contentType: 'image/jpeg',
      })
    ).json<{ entryId: string; fileId: string }>();
    await env.FILES.put(
      `app-branch-TE1/treasury/${started.entryId}/${started.fileId}-r.jpg`,
      'jpg',
      { httpMetadata: { contentType: 'image/jpeg' } },
    );
    const saved = await debit(10, {
      entryId: started.entryId,
      receipts: [{ fileId: started.fileId, fileName: 'r.jpg' }],
    });
    expect(await saved.json()).toMatchObject({ entryId: started.entryId, warnings: [] });
    const entry = (await history(bank)).entries.find((e) => e.id === started.entryId);
    expect(entry?.receipts).toMatchObject([{ fileName: 'r.jpg' }]);
    const file = await call(
      treasurer.clerkUserId,
      'GET',
      `${base()}/entries/${started.entryId}/receipts/${entry?.receipts[0]?.id ?? ''}/file`,
    );
    expect(await file.text()).toBe('jpg');
  });
});
