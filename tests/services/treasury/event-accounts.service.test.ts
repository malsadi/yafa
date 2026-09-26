import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AccountRecord, AccountsView } from '../../../src/shared/treasury/treasury-records';
import {
  closeEventAccount,
  openEventAccount,
  yearEndSummary,
} from '../../../src/worker/services/treasury';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from '../../api/treasury/treasury-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TVNV';
let treasurer: Officer;
let branch = '';

const accounts = async () =>
  (
    await (
      await call(treasurer.clerkUserId, 'GET', `${unitPath(treasurer.unitId)}/accounts`)
    ).json<AccountsView>()
  ).accounts;
async function find(id: string): Promise<AccountRecord> {
  const account = (await accounts()).find((a) => a.id === id);
  if (!account) throw new Error(`No account ${id}`);
  return account;
}
const post = (path: string, body: object) =>
  call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}${path}`, body);

async function eventWith(eventId: string): Promise<{ accountId: string; lineId: string }> {
  const opened = openEventAccount(env.DB, {
    unitId: treasurer.unitId,
    eventId,
    name: `Event ${eventId}`,
    budgetLines: [
      { name: 'Venue', amountPence: 5000 },
      { name: 'Food', amountPence: 3000 },
    ],
    actor: treasurer.personId,
  });
  await env.DB.batch(opened.statements);
  const line = await env.DB.prepare(
    "SELECT id FROM treasury_budget_lines WHERE account_id = ? AND name = 'Venue'",
  )
    .bind(opened.accountId)
    .first<{ id: string }>();
  return { accountId: opened.accountId, lineId: line?.id ?? '' };
}

describe('event accounts, internal to the Event organiser (brief 17 A2; P8, P10; D-131)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    treasurer = await treasuryOfficer({
      suffix: 'TV1',
      notice: NOTICE,
      capabilities: [
        'treasury.accounts.read',
        'treasury.accounts.manage',
        'treasury.credit.create',
        'treasury.debit.create',
      ],
    });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 100000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    branch = await openAccount(treasurer, 'Bank', 20000, '2026-04-01');
  });

  it('opens with budget lines, takes entries tagged to them, and refuses closing through the Treasury', async () => {
    const event = await eventWith('ev-1');
    expect(
      (
        await post('/credits', {
          accountId: event.accountId,
          amountPence: 7000,
          entryDate: '2026-06-01',
          counterparty: 'Tickets',
          description: 'Sales',
          budgetLineId: event.lineId,
        })
      ).status,
    ).toBe(201);
    expect(await find(event.accountId)).toMatchObject({
      kind: 'event',
      status: 'Open',
      balancePence: 7000,
    });
    const res = await post(`/accounts/${event.accountId}/close`, {});
    expect(await res.json()).toMatchObject({
      error: { code: 'treasury.event-account-by-event-organiser' },
    });
  });

  it('on close, returns a balance to the branch account: event at zero, branch higher by exactly that', async () => {
    const before = (await find(branch)).balancePence;
    const eventId = (await accounts()).find((a) => a.eventId === 'ev-1')?.id ?? '';
    const close = await closeEventAccount(env.DB, {
      eventId: 'ev-1',
      branchAccountId: branch,
      description: null,
      actor: treasurer.personId,
    });
    expect(close.balancePence).toBe(7000);
    await env.DB.batch(close.statements);
    expect(await find(eventId)).toMatchObject({ status: 'Closed', balancePence: 0 });
    expect((await find(branch)).balancePence).toBe(before + 7000);
  });

  it('brings an overspent event to zero from the branch account (D-131), with no approval (P8)', async () => {
    const event = await eventWith('ev-2');
    await post('/debits', {
      accountId: event.accountId,
      amountPence: 4000,
      entryDate: '2026-06-02',
      counterparty: 'Caterer',
      description: 'Food',
    });
    const before = (await find(branch)).balancePence;
    const close = await closeEventAccount(env.DB, {
      eventId: 'ev-2',
      branchAccountId: branch,
      description: null,
      actor: treasurer.personId,
    });
    expect(close.balancePence).toBe(-4000);
    await env.DB.batch(close.statements);
    expect(await find(event.accountId)).toMatchObject({ status: 'Closed', balancePence: 0 });
    expect((await find(branch)).balancePence).toBe(before - 4000);
    await expect(
      closeEventAccount(env.DB, {
        eventId: 'ev-2',
        branchAccountId: branch,
        description: null,
        actor: treasurer.personId,
      }),
    ).rejects.toThrow('treasury.account-closed');
  });

  it("sums the year: each account's start, what came and went by kind, and its end (D-130)", async () => {
    const summary = await yearEndSummary(env.DB, treasurer.unitId, 2026);
    expect(summary).toMatchObject({ start: '2026-04-01', end: '2027-03-31', closed: false });
    const bank = summary.accounts.find((a) => a.accountId === branch);
    expect(bank).toMatchObject({
      startBalancePence: 0,
      openingBalancesPence: 20000,
      transfersInPence: 7000,
      transfersOutPence: 4000,
      endBalancePence: 23000,
    });
    for (const a of [...summary.accounts, { ...summary.totals }]) {
      expect(a.endBalancePence).toBe(
        a.startBalancePence +
          a.openingBalancesPence +
          a.creditsPence -
          a.debitsPence +
          a.transfersInPence -
          a.transfersOutPence,
      );
    }
    expect(summary.totals.endBalancePence).toBe(23000);
  });
});
