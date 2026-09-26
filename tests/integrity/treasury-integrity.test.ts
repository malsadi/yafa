import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AccountsView } from '../../src/shared/treasury/treasury-records';
import { listRegisteredRoutes } from '../../src/worker/core/permissions';
import { buildTestApp, insertNoticeVersion, ORIGIN } from '../app/app-fixtures';
import {
  call,
  colleagueOf,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from '../api/treasury/treasury-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TINV';
let treasurer: Officer;
let approver: Officer;
let bank = '';
let cash = '';

const balances = async () =>
  (
    await (
      await call(treasurer.clerkUserId, 'GET', `${unitPath(treasurer.unitId)}/accounts`)
    ).json<AccountsView>()
  ).accounts;

/** The balance worked out by hand from the entries table: only those that count (P7), each way. */
async function summedByHand(accountId: string): Promise<number> {
  const { results } = await env.DB.prepare(
    `SELECT type, account_id AS accountId, to_account_id AS toAccountId, amount_pence AS amount
     FROM treasury_entries WHERE (account_id = ?1 OR to_account_id = ?1) AND approval_status IN ('Not needed', 'Approved')`,
  )
    .bind(accountId)
    .all<{ type: string; accountId: string; toAccountId: string | null; amount: number }>();
  return results.reduce((sum, e) => {
    if (e.type === 'transfer') return sum + (e.toAccountId === accountId ? e.amount : -e.amount);
    return sum + (e.type === 'debit' ? -e.amount : e.amount);
  }, 0);
}

describe('Treasury integrity (brief 17 build notes; 9.1; build rules 3 to 5)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    const all = [
      'treasury.accounts.read',
      'treasury.accounts.manage',
      'treasury.credit.create',
      'treasury.debit.create',
      'treasury.transfer.create',
      'treasury.debit.approve',
      'treasury.entries.correct',
    ];
    treasurer = await treasuryOfficer({ suffix: 'TI1', notice: NOTICE, capabilities: all });
    approver = await colleagueOf(treasurer, { suffix: 'TI2', notice: NOTICE, capabilities: all });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 3000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    bank = await openAccount(treasurer, 'Bank', 50000, '2026-04-01');
    cash = await openAccount(treasurer, 'Cash', -700, '2026-04-01');
  });

  it('never corrupts a balance with entries saved at the same moment, and every balance is the sum of its counted entries', async () => {
    // One app, many requests at once, as the Worker takes them.
    const { app, tokenFor } = await buildTestApp();
    const tokens = new Map([
      [treasurer.clerkUserId, await tokenFor(treasurer.clerkUserId)],
      [approver.clerkUserId, await tokenFor(approver.clerkUserId)],
    ]);
    const send = (who: Officer, path: string, body: object) =>
      Promise.resolve(
        app.request(`${ORIGIN}${unitPath(treasurer.unitId)}${path}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.get(who.clerkUserId) ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }),
      );
    const saves = Array.from({ length: 24 }, (_, i) => {
      const who = i % 2 === 0 ? treasurer : approver;
      if (i % 3 === 0)
        return send(who, '/credits', {
          accountId: bank,
          amountPence: 100 + i,
          entryDate: '2026-06-01',
          counterparty: 'In',
          description: `Credit ${String(i)}`,
        });
      if (i % 3 === 1)
        return send(who, '/debits', {
          accountId: bank,
          amountPence: 2000 + i * 100,
          entryDate: '2026-06-02',
          counterparty: 'Out',
          description: `Debit ${String(i)}`,
        });
      return send(who, '/transfers', {
        accountId: bank,
        toAccountId: cash,
        amountPence: 50 + i,
        entryDate: '2026-06-03',
        description: `Move ${String(i)}`,
      });
    });
    expect((await Promise.all(saves)).every((res) => res.status === 201)).toBe(true);
    const awaiting = await env.DB.prepare(
      "SELECT id, created_by AS createdBy FROM treasury_entries WHERE approval_status = 'Awaiting approval'",
    ).all<{ id: string; createdBy: string }>();
    expect(awaiting.results.length).toBeGreaterThan(0);
    const decisions = await Promise.all(
      awaiting.results.map((e) =>
        send(
          e.createdBy === treasurer.personId ? approver : treasurer,
          `/entries/${e.id}/approve`,
          {},
        ),
      ),
    );
    expect(decisions.every((res) => res.status === 200)).toBe(true);
    for (const account of await balances()) {
      expect(account.balancePence, account.name).toBe(await summedByHand(account.id));
    }
  });

  it('has no path that deletes anything in the Treasury', async () => {
    await buildTestApp();
    const deletes = listRegisteredRoutes().filter(
      (r) => r.path.startsWith('/api/treasury') && r.method === 'DELETE',
    );
    expect(deletes).toEqual([]);
  });

  it('never edits or deletes an entry: every column is refused, except the one approval decision', async () => {
    const { id } = (await env.DB.prepare(
      "SELECT id FROM treasury_entries WHERE unit_id = ? AND type = 'credit' LIMIT 1",
    )
      .bind(treasurer.unitId)
      .first<{ id: string }>()) ?? { id: '' };
    for (const assignment of [
      'amount_pence = 1',
      "entry_date = '2026-01-01'",
      "description = 'x'",
      "counterparty = 'x'",
      "account_id = account_id || ''",
      "approval_status = 'Approved', decided_by = 'x', decided_at = 'x'",
    ]) {
      await expect(
        env.DB.prepare(`UPDATE treasury_entries SET ${assignment} WHERE id = ?`).bind(id).run(),
        assignment,
      ).rejects.toThrow(/never changed|CHECK|FOREIGN/);
    }
    await expect(
      env.DB.prepare('DELETE FROM treasury_entries WHERE id = ?').bind(id).run(),
    ).rejects.toThrow(/never deleted/);
    await expect(
      env.DB.prepare('DELETE FROM treasury_accounts WHERE id = ?').bind(bank).run(),
    ).rejects.toThrow(/never deleted/);
  });

  it('never lets an account close away from zero, in the database', async () => {
    await expect(
      env.DB.prepare(
        "UPDATE treasury_accounts SET status = 'Closed', closed_by = 'x', closed_at = 'x' WHERE id = ?",
      )
        .bind(bank)
        .run(),
    ).rejects.toThrow(/not zero/);
  });
});
