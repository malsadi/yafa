import type { SavedEntry } from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireTreasuryWriter } from '../treasury-access';
import { approvalFor, belowZeroWarnings, requireOpenAccount } from './entry-checks';
import { requireEntryDate } from './entry-dates';
import { buildInsertEntryStatement } from './entries.repo';
import type { Transfer } from './entries.schema';

/**
 * Brief 17 B3 and D-122: one record that debits one of the unit's open
 * accounts and credits another, atomically. Above the threshold it waits
 * for a second officer, and moves nothing until approved.
 */
export async function recordTransfer(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; transfer: Transfer },
): Promise<SavedEntry> {
  const { transfer } = params;
  const unit = await requireTreasuryWriter(db, ctx, 'treasury.transfer.create', params.unitId);
  const from = await requireOpenAccount(db, unit.id, transfer.accountId);
  const to = await requireOpenAccount(db, unit.id, transfer.toAccountId);
  await requireEntryDate(db, unit.id, transfer.entryDate);
  const approvalStatus = await approvalFor(db, unit.id, transfer.amountPence);
  const row = {
    id: generateId(),
    unitId: unit.id,
    type: 'transfer' as const,
    accountId: from.id,
    toAccountId: to.id,
    amountPence: transfer.amountPence,
    entryDate: transfer.entryDate,
    counterparty: null,
    description: transfer.description,
    budgetLineId: null,
    approvalStatus,
    reversesEntryId: null,
    createdBy: ctx.personId,
  };
  await db.batch([
    buildInsertEntryStatement(db, { ...row, at: new Date().toISOString() }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-entry.transfer',
      entityType: 'treasury-entry',
      entityId: row.id,
      after: row,
    }),
  ]);
  return { entryId: row.id, approvalStatus, warnings: await belowZeroWarnings(db, [from.id]) };
}
