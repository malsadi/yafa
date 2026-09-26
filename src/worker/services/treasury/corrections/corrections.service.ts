import type { SavedEntry } from '../../../../shared/treasury/treasury-records';
import type { EntryType } from '../../../../shared/treasury/treasury-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { belowZeroWarnings, requireOpenAccount } from '../entries/entry-checks';
import { requireEntryDate } from '../entries/entry-dates';
import { buildInsertEntryStatement, findEntry, type EntryRow } from '../entries/entries.repo';
import { requireTreasuryWriter } from '../treasury-access';

const OPPOSITE: Record<EntryType, EntryType> = {
  credit: 'debit',
  debit: 'credit',
  transfer: 'transfer',
  'opening-balance': 'opening-balance',
};

/** B6: the entry that undoes `original` — its opposite, for the same amount, on the same accounts. */
function reversalOf(
  original: EntryRow,
  params: { id: string; date: string; description: string | null; actor: string },
): EntryRow {
  const transfer = original.type === 'transfer';
  return {
    id: params.id,
    unitId: original.unitId,
    type: OPPOSITE[original.type],
    accountId: transfer && original.toAccountId ? original.toAccountId : original.accountId,
    toAccountId: transfer ? original.accountId : null,
    amountPence: original.type === 'opening-balance' ? -original.amountPence : original.amountPence,
    entryDate: params.date,
    counterparty: original.counterparty,
    description: params.description,
    budgetLineId: original.budgetLineId,
    approvalStatus: 'Not needed',
    reversesEntryId: original.id,
    createdBy: params.actor,
  };
}

/** A counted entry of the unit's, never reversed, and not itself a reversal (the triggers also refuse). */
async function requireReversible(
  db: D1Database,
  unitId: string,
  entryId: string,
): Promise<EntryRow> {
  const entry = await findEntry(db, entryId);
  if (entry?.unitId !== unitId) throw new NotFoundError('treasury.entry-not-found');
  if (entry.reversesEntryId) throw new ConflictError('treasury.reversal-not-reversed');
  if (!['Not needed', 'Approved'].includes(entry.approvalStatus))
    throw new ConflictError('treasury.not-counted');
  const reversed = await db
    .prepare('SELECT 1 AS done FROM treasury_entries WHERE reverses_entry_id = ?')
    .bind(entryId)
    .first();
  if (reversed) throw new ConflictError('treasury.already-reversed');
  return entry;
}

/**
 * Brief 17 B6 and D-126: correct a mistake with a reversing entry, dated
 * today and linked to the original, needing no approval whatever its size.
 * The right entry is then recorded as a new one.
 */
export async function reverseEntry(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; entryId: string; description: string | null },
): Promise<SavedEntry> {
  await requireTreasuryWriter(db, ctx, 'treasury.entries.correct', params.unitId);
  const original = await requireReversible(db, params.unitId, params.entryId);
  const date = getTodayInLondon();
  await requireEntryDate(db, params.unitId, date);
  const row = reversalOf(original, {
    id: generateId(),
    date,
    description: params.description,
    actor: ctx.personId,
  });
  await requireOpenAccount(db, params.unitId, row.accountId);
  if (row.toAccountId) await requireOpenAccount(db, params.unitId, row.toAccountId);
  await db.batch([
    buildInsertEntryStatement(db, { ...row, at: new Date().toISOString() }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-entry.reversed',
      entityType: 'treasury-entry',
      entityId: original.id,
      after: row,
    }),
  ]);
  return {
    entryId: row.id,
    approvalStatus: 'Not needed',
    warnings: await belowZeroWarnings(db, [row.accountId]),
  };
}
