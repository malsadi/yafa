import { beforeAll, describe, expect, it } from 'vitest';
import type { AccountsView } from '../../../src/shared/treasury/treasury-records';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from './treasury-fixtures';
import { tryEveryRoute } from '../../immutability/try-every-route';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TANV';
let treasurer: Officer;
let reader: Officer;
let switchedOff: Officer;

const accounts = async (o: Officer) =>
  (await call(o.clerkUserId, 'GET', `${unitPath(o.unitId)}/accounts`)).json<AccountsView>();

describe('branch accounts (brief 17 A1, C1; P6; D-117 to D-119, D-127)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    const all = [
      'treasury.accounts.read',
      'treasury.accounts.manage',
      'treasury.credit.create',
      'treasury.debit.create',
      'treasury.transfer.create',
      'treasury.statements.file',
    ];
    treasurer = await treasuryOfficer({ suffix: 'TA1', notice: NOTICE, capabilities: all });
    reader = await treasuryOfficer({
      suffix: 'TA2',
      notice: NOTICE,
      capabilities: ['treasury.accounts.read'],
    });
    switchedOff = await treasuryOfficer({ suffix: 'TA3', notice: NOTICE, capabilities: all });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 50000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    await readyTreasury(reader.unitId, {
      thresholdPence: 50000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
  });

  it('opens bank and cash accounts with an opening balance — negative too — and totals the open ones', async () => {
    await openAccount(treasurer, 'Current account', 125000);
    await openAccount(treasurer, 'Overdraft', -2500);
    const view = await accounts(treasurer);
    expect(view.accounts.map((a) => [a.name, a.status, a.balancePence, a.branchType])).toEqual([
      ['Current account', 'Open', 125000, 'bank'],
      ['Overdraft', 'Open', -2500, 'bank'],
    ]);
    expect(view.unitTotalPence).toBe(122500);
  });

  it('closes an account only at zero, stating the balance, and never takes an entry after (D-118)', async () => {
    const [current] = (await accounts(treasurer)).accounts;
    const close = (id: string) =>
      call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}/accounts/${id}/close`, {});
    const refused = await close(current?.id ?? '');
    expect(refused.status).toBe(409);
    expect(await refused.json()).toEqual({
      error: { code: 'treasury.not-zero', values: { balance: 125000, awaiting: 0 } },
    });
    const empty = await openAccount(treasurer, 'Petty cash', 0);
    expect((await close(empty)).status).toBe(204);
    expect((await close(empty)).status).toBe(409);
    const credit = await call(
      treasurer.clerkUserId,
      'POST',
      `${unitPath(treasurer.unitId)}/credits`,
      {
        accountId: empty,
        amountPence: 100,
        entryDate: '2026-06-01',
        counterparty: 'Donor',
        description: 'Gift',
      },
    );
    expect(credit.status).toBe(409);
    expect((await accounts(treasurer)).unitTotalPence).toBe(122500);
  });

  it('refuses every change to a closed account through every route (brief 26; D-118)', async () => {
    const A = '/api/treasury/units/:unitId/accounts/:accountId';
    const closed = (await accounts(treasurer)).accounts.find((a) => a.status === 'Closed');
    expect(closed).toBeDefined();
    const id = closed?.id ?? '';
    const result = await tryEveryRoute(
      (method, path, body) => call(treasurer.clerkUserId, method, path, body),
      {
        prefixes: [A],
        params: { unitId: treasurer.unitId, accountId: id },
        bodies: {
          [`POST ${A}/opening-balance`]: { openingBalancePence: 100, openingDate: '2026-06-01' },
          [`POST ${A}/statement/file`]: { from: '2026-01-01', to: '2026-06-30', language: 'en' },
        },
        rows: [
          { sql: 'SELECT * FROM treasury_accounts WHERE id = ?', binds: [id] },
          { sql: 'SELECT * FROM treasury_entries WHERE account_id = ? ORDER BY id', binds: [id] },
        ],
      },
    );
    expect(result.tried.length).toBeGreaterThanOrEqual(3);
    expect(result.failed).toEqual([]);
    expect(result.accepted).toEqual([]);
    expect(result.rowsChanged).toBe(false);
    const [open] = (await accounts(treasurer)).accounts.filter((a) => a.status === 'Open');
    const money = { amountPence: 100, entryDate: '2026-06-01', description: 'Late' };
    for (const [kind, body] of [
      ['debits', { ...money, accountId: id, counterparty: 'X' }],
      ['transfers', { ...money, accountId: open?.id ?? '', toAccountId: id }],
      ['transfers', { ...money, accountId: id, toAccountId: open?.id ?? '' }],
    ] as const)
      expect(
        (await call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}/${kind}`, body))
          .status,
      ).toBe(409);
  });

  it("keeps a unit's Treasury to its own officers, and hides it where switched off (D-132; 8.4)", async () => {
    expect(
      (await call(reader.clerkUserId, 'GET', `${unitPath(treasurer.unitId)}/accounts`)).status,
    ).toBe(403);
    const open = {
      name: 'Cash box',
      branchType: 'cash',
      openingBalancePence: 0,
      openingDate: '2026-05-01',
    };
    expect(
      (await call(reader.clerkUserId, 'POST', `${unitPath(reader.unitId)}/accounts`, open)).status,
    ).toBe(403);
    expect(
      (await call(switchedOff.clerkUserId, 'GET', `${unitPath(switchedOff.unitId)}/accounts`))
        .status,
    ).toBe(404);
  });

  it('refuses an opening date in the future', async () => {
    const res = await call(
      treasurer.clerkUserId,
      'POST',
      `${unitPath(treasurer.unitId)}/accounts`,
      {
        name: 'Later',
        branchType: 'cash',
        openingBalancePence: 0,
        openingDate: '2999-01-01',
      },
    );
    expect(await res.json()).toMatchObject({ error: { code: 'treasury.future-date' } });
  });
});
