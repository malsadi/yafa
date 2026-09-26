import type { SavedEntry, TreasuryWarning } from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { FileStorage } from '../../../core/files';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { receiptStatements } from '../receipts/receipt-files';
import { requireTreasuryWriter } from '../treasury-access';
import { receiptRequired } from '../treasury-settings';
import {
  approvalFor,
  belowZeroWarnings,
  requireBudgetLine,
  requireOpenAccount,
} from './entry-checks';
import { requireEntryDate } from './entry-dates';
import { buildInsertEntryStatement, findEntry } from './entries.repo';
import type { MoneyEntry } from './entries.schema';

const CAPABILITY = { credit: 'treasury.credit.create', debit: 'treasury.debit.create' } as const;

/** D-123: a new entry's id — the one its receipts were uploaded under, which must be unused. */
async function newEntryId(db: D1Database, entryId: string | undefined): Promise<string> {
  if (entryId === undefined) return generateId();
  if (await findEntry(db, entryId)) throw new ConflictError('treasury.entry-exists');
  return entryId;
}

/** The account, date, budget line and receipts are right; and whether the entry waits for approval. */
async function checkMoneyEntry(
  db: D1Database,
  unitId: string,
  type: 'credit' | 'debit',
  entry: MoneyEntry,
) {
  const account = await requireOpenAccount(db, unitId, entry.accountId);
  await requireEntryDate(db, unitId, entry.entryDate);
  await requireBudgetLine(db, account, entry.budgetLineId);
  if (entry.receipts.length === 0 && (await receiptRequired(db, unitId))) {
    throw new ConflictError('treasury.receipt-required');
  }
  const approvalStatus =
    type === 'debit' ? await approvalFor(db, unitId, entry.amountPence) : 'Not needed';
  return { account, approvalStatus } as const;
}

/**
 * Brief 17 B1, B2, B4, B5 and P7, P10, D-120 to D-123: record money in or
 * out, with its receipts, in one batch — files checked in R2 first. A debit
 * above the threshold waits for a second officer. Warnings inform and never
 * block: an account below zero, a missing receipt.
 */
export async function recordMoneyEntry(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; type: 'credit' | 'debit'; entry: MoneyEntry },
): Promise<SavedEntry> {
  const { entry, type } = params;
  const unit = await requireTreasuryWriter(db, ctx, CAPABILITY[type], params.unitId);
  const { account, approvalStatus } = await checkMoneyEntry(db, unit.id, type, entry);
  const at = new Date().toISOString();
  const row = {
    id: await newEntryId(db, entry.entryId),
    unitId: unit.id,
    type,
    accountId: account.id,
    toAccountId: null,
    amountPence: entry.amountPence,
    entryDate: entry.entryDate,
    counterparty: entry.counterparty,
    description: entry.description,
    budgetLineId: entry.budgetLineId,
    approvalStatus,
    reversesEntryId: null,
    createdBy: ctx.personId,
  };
  const receipts = await receiptStatements(db, storage, {
    unit,
    entryId: row.id,
    receipts: entry.receipts,
    actor: ctx.personId,
    at,
  });
  await db.batch([
    buildInsertEntryStatement(db, { ...row, at }),
    ...receipts,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: `treasury-entry.${type}`,
      entityType: 'treasury-entry',
      entityId: row.id,
      after: row,
    }),
  ]);
  const warnings: TreasuryWarning[] = await belowZeroWarnings(db, [account.id]);
  if (entry.receipts.length === 0) warnings.push({ code: 'no-receipt' });
  return { entryId: row.id, approvalStatus, warnings };
}
