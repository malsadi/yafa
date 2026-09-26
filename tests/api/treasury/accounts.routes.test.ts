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
