import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { closeFinancialYear } from '../../../src/worker/services/treasury/year-end-close/year-end-close.service';
import { fileStatement } from '../../../src/worker/services/treasury/statements/statements.service';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  call,
  openAccount,
  readyTreasury,
  treasuryOfficer,
  unitPath,
  type Officer,
} from '../../api/treasury/treasury-fixtures';
import { contextOf, fakeRenderer, nameOrganisation, storage } from './treasury-service-fixtures';
import { tryEveryRoute } from '../../immutability/try-every-route';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TYNV';
let treasurer: Officer;
let bank = '';
let cash = '';
const renderer = fakeRenderer();
const close = (start: string) =>
  closeFinancialYear(
    env.DB,
    contextOf(treasurer),
    { storage, render: renderer.render },
    { unitId: treasurer.unitId, start, language: 'en' },
  );
const credit = (accountId: string, entryDate: string) =>
  call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}/credits`, {
    accountId,
    amountPence: 1000,
    entryDate,
    counterparty: 'Donor',
    description: 'Gift',
  });

describe('the year-end close (brief 17 C3; P9; D-128)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    treasurer = await treasuryOfficer({
      suffix: 'TY1',
      notice: NOTICE,
      capabilities: [
        'treasury.accounts.read',
        'treasury.accounts.manage',
        'treasury.credit.create',
        'treasury.debit.create',
        'treasury.year-end.close',
        'treasury.statements.file',
        'treasury.transfer.create',
        'treasury.debit.approve',
        'treasury.entries.correct',
      ],
    });
    await readyTreasury(treasurer.unitId, {
      thresholdPence: 500,
      receiptRequired: false,
      actor: treasurer.personId,
    });
    await nameOrganisation(treasurer.personId);
    bank = await openAccount(treasurer, 'Bank', 5000, '2024-05-01');
    cash = await openAccount(treasurer, 'Cash', 0, '2025-05-01');
    await credit(bank, '2025-06-01');
  });

  it('refuses a year that has not ended, a day that starts no year, and a year after one still open', async () => {
    await expect(close('2026-04-01')).rejects.toThrow('treasury.year-not-ended');
    await expect(close('2025-06-01')).rejects.toThrow('treasury.not-a-year-start');
    await expect(close('2025-04-01')).rejects.toThrow('treasury.earlier-year-open');
  });

  it('refuses a year with a debit awaiting approval, saying how many', async () => {
    await call(treasurer.clerkUserId, 'POST', `${unitPath(treasurer.unitId)}/debits`, {
      accountId: bank,
      amountPence: 900,
      entryDate: '2024-06-01',
      counterparty: 'X',
      description: 'Y',
    });
    await expect(close('2024-04-01')).rejects.toMatchObject({
      code: 'treasury.awaiting-in-year',
      values: { awaiting: 1 },
    });
    await env.DB.prepare(
      "UPDATE treasury_entries SET approval_status = 'Declined', decided_by = 'someone-else', decided_at = 'now', decline_reason = 'No' WHERE approval_status = 'Awaiting approval'",
    ).run();
  });

  it('closes a year, locking its entries, and files a statement for every account it saw (P9)', async () => {
    await close('2024-04-01');
    expect(renderer.rendered.map((d) => d.title)).toEqual(['Statement: Bank']);
    await fileStatement(
      env.DB,
      contextOf(treasurer),
      { storage, render: renderer.render },
      {
        unitId: treasurer.unitId,
        accountId: bank,
        from: '2025-04-01',
        to: '2026-03-31',
        language: 'en',
      },
    );
    await close('2025-04-01');
    expect(renderer.rendered.map((d) => d.title)).toEqual([
      'Statement: Bank',
      'Statement: Bank',
      'Statement: Cash',
    ]);
    const filed = await env.DB.prepare(
      'SELECT d.title, d.category_id AS category, d.document_date AS date, f.locked FROM archive_documents d JOIN archive_document_versions v ON v.document_id = d.id JOIN files f ON f.id = v.file_id WHERE d.unit_id = ? ORDER BY d.filed_at, d.title',
    )
      .bind(treasurer.unitId)
      .all<{ title: string; category: string; date: string; locked: number }>();
    expect(filed.results.map((r) => [r.category, r.date, r.locked])).toEqual([
      ['finance', '2025-03-31', 1],
      ['finance', '2026-03-31', 1],
      ['finance', '2026-03-31', 1],
    ]);
    expect(await (await credit(cash, '2025-07-01')).json()).toMatchObject({
      error: { code: 'treasury.closed-year' },
    });
    await expect(close('2025-04-01')).rejects.toThrow('treasury.year-closed');
  });

  it('never lets an entry into a closed year, nor a closed year reopen, in the database', async () => {
    await expect(
      env.DB.prepare(
        `INSERT INTO treasury_entries (id, unit_id, type, account_id, amount_pence, entry_date, counterparty, approval_status, created_by, created_at)
         VALUES ('late', ?, 'credit', ?, 1, '2025-07-01', 'X', 'Not needed', 'p', 'now')`,
      )
        .bind(treasurer.unitId, cash)
        .run(),
    ).rejects.toThrow(/closed year/);
    await expect(
      env.DB.prepare('DELETE FROM treasury_financial_years WHERE unit_id = ?')
        .bind(treasurer.unitId)
        .run(),
    ).rejects.toThrow(/stays closed/);
  });

  it('refuses every change to the entries of a closed year through every route (brief 26; D-128)', async () => {
    const U = '/api/treasury/units/:unitId';
    const entry = await env.DB.prepare(
      "SELECT id FROM treasury_entries WHERE unit_id = ? AND entry_date = '2025-06-01'",
    )
      .bind(treasurer.unitId)
      .first<{ id: string }>();
    expect(entry).not.toBeNull();
    const receipts = { fileId: 'x', fileName: 'late.jpg' };
    const inClosedYear = { amountPence: 1, entryDate: '2025-07-01', description: 'Late' };
    const result = await tryEveryRoute(
      (method, path, body) => call(treasurer.clerkUserId, method, path, body),
      {
        prefixes: [`${U}/entries/:entryId`, `${U}/credits/:entryId`, `${U}/debits/:entryId`],
        params: { unitId: treasurer.unitId, entryId: entry?.id ?? '' },
        bodies: {
          [`POST ${U}/entries/:entryId/decline`]: { reason: 'Late' },
          [`POST ${U}/entries/:entryId/reverse`]: { description: 'Late' },
          [`POST ${U}/credits/:entryId/receipts/uploads`]: {
            fileName: 'late.jpg',
            size: 10,
            contentType: 'image/jpeg',
          },
          [`PUT ${U}/credits/:entryId/receipts`]: receipts,
          [`PUT ${U}/debits/:entryId/receipts`]: receipts,
        },
        rows: [
          {
            sql: "SELECT * FROM treasury_entries WHERE unit_id = ? AND entry_date BETWEEN '2025-04-01' AND '2026-03-31' ORDER BY id",
            binds: [treasurer.unitId],
          },
          {
            sql: `SELECT r.* FROM treasury_entry_receipts r JOIN treasury_entries e ON e.id = r.entry_id
                  WHERE e.unit_id = ? ORDER BY r.entry_id, r.file_id`,
            binds: [treasurer.unitId],
          },
        ],
      },
    );
    expect(result.tried.length).toBeGreaterThanOrEqual(7);
    expect(result.rowsChanged).toBe(false);
    expect(result.failed).toEqual([]);
    // D-126 and O-173 (open): a correction is a new reversing entry dated the
    // day it is made, so one in the open year may undo a closed year's entry;
    // the closed year's own entries stay exactly as they were.
    expect(result.accepted).toEqual([`POST ${U}/entries/:entryId/reverse → 201`]);
    const reversal = await env.DB.prepare(
      'SELECT entry_date AS date FROM treasury_entries WHERE reverses_entry_id = ?',
    )
      .bind(entry?.id ?? '')
      .first<{ date: string }>();
    expect((reversal?.date ?? '') > '2026-03-31').toBe(true);
    const path = unitPath(treasurer.unitId);
    for (const [kind, body] of [
      ['debits', { ...inClosedYear, accountId: bank, counterparty: 'X' }],
      ['transfers', { ...inClosedYear, accountId: bank, toAccountId: cash }],
    ] as const)
      expect(
        await (await call(treasurer.clerkUserId, 'POST', `${path}/${kind}`, body)).json(),
      ).toMatchObject({
        error: { code: 'treasury.closed-year' },
      });
  });
});
