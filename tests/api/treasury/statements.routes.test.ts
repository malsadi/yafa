import { beforeAll, describe, expect, it } from 'vitest';
import type { StatementData } from '../../../src/shared/treasury/statement';
import { insertNoticeVersion } from '../../app/app-fixtures';
import { nameOrganisation } from '../../services/treasury/treasury-service-fixtures';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from './treasury-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TSNV';
let treasurer: Officer;
let bank = '';
let cash = '';

const statement = async (query: string) =>
  call(
    treasurer.clerkUserId,
    'GET',
    `${unitPath(treasurer.unitId)}/accounts/${bank}/statement${query}`,
  );

describe('statements (brief 17 C2; P9; D-128)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    treasurer = await treasuryOfficer({
      suffix: 'TS1',
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
      thresholdPence: 5000,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    bank = await openAccount(treasurer, 'Bank', 10000, '2026-04-01');
    cash = await openAccount(treasurer, 'Cash', 0, '2026-04-01');
    const post = (path: string, body: object) =>
      call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}${path}`, body);
    await post('/credits', {
      accountId: bank,
      amountPence: 2000,
      entryDate: '2026-05-01',
      counterparty: 'Donor',
      description: 'Gift',
    });
    await post('/debits', {
      accountId: bank,
      amountPence: 9000,
      entryDate: '2026-05-02',
      counterparty: 'Hall',
      description: 'Hire',
    });
    await post('/transfers', {
      accountId: bank,
      toAccountId: cash,
      amountPence: 500,
      entryDate: '2026-06-01',
      description: 'Float',
    });
  });

  it('gives the balance at the start, each counted entry with the balance after it, and the balance at the end', async () => {
    const data = await (await statement('?from=2026-05-01&to=2026-06-30')).json<StatementData>();
    expect(data.openingBalancePence).toBe(10000);
    expect(
      data.lines.map((l) => [l.type, l.inPence, l.outPence, l.balancePence, l.otherAccountName]),
    ).toEqual([
      ['credit', 2000, 0, 12000, null],
      ['transfer', 0, 500, 11500, 'Cash'],
    ]);
    expect(data.closingBalancePence).toBe(11500);
  });

  it('refuses a period that ends before it starts', async () => {
    expect((await statement('?from=2026-06-30&to=2026-05-01')).status).toBe(400);
  });

  it('makes the PDF only once the organisation is named, and says when rendering is not available here', async () => {
    const pdf = () => statement('/pdf?from=2026-05-01&to=2026-06-30&language=ar');
    expect(await (await pdf()).json()).toEqual({ error: { code: 'setting.not-configured' } });
    await nameOrganisation(treasurer.personId);
    expect(await (await pdf()).json()).toEqual({ error: { code: 'pdf.not-available' } });
  });
});
