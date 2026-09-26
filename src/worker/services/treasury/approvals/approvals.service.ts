import type { EntryRecord, TreasuryWarning } from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { findEntry } from '../entries/entries.repo';
import { belowZeroWarnings } from '../entries/entry-checks';
import { listReceiptsOf } from '../receipts/receipts.repo';
import { requireTreasuryCapability, requireTreasuryWriter } from '../treasury-access';
import { buildDecisionStatement, listAwaiting } from './approvals.repo';

const APPROVE = 'treasury.debit.approve';

/** P7 and D-133: what awaits a second officer in the unit — the list approvers work from. */
export async function listAwaitingApproval(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<EntryRecord[]> {
  await requireTreasuryCapability(db, ctx, APPROVE, unitId);
  const rows = await listAwaiting(db, unitId);
  const receipts = await listReceiptsOf(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    ...row,
    receipts: receipts
      .filter((r) => r.entryId === row.id)
      .map(({ id, fileName }) => ({ id, fileName })),
  }));
}

/**
 * Brief 17 B5, 7.3, P7 and D-122: approve or decline a debit or transfer
 * awaiting approval — never by the officer who entered it (a trigger also
 * refuses). Declined, it stays in the history with who and why. Approved,
 * it counts from now, with a warning if an account goes below zero (D-120).
 */
export async function decideEntry(
  db: D1Database,
  ctx: RequestContext,
  params: {
    unitId: string;
    entryId: string;
    decision: 'Approved' | 'Declined';
    reason: string | null;
  },
): Promise<{ warnings: TreasuryWarning[] }> {
  await requireTreasuryWriter(db, ctx, APPROVE, params.unitId);
  const entry = await findEntry(db, params.entryId);
  if (entry?.unitId !== params.unitId) throw new NotFoundError('treasury.entry-not-found');
  if (entry.approvalStatus !== 'Awaiting approval')
    throw new ConflictError('treasury.not-awaiting');
  if (entry.createdBy === ctx.personId) throw new ForbiddenError('treasury.self-approval');
  if (params.decision === 'Declined' && !params.reason)
    throw new ConflictError('treasury.reason-required');
  const at = new Date().toISOString();
  await db.batch([
    buildDecisionStatement(db, {
      entryId: entry.id,
      decision: params.decision,
      actor: ctx.personId,
      at,
      reason: params.reason,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action:
        params.decision === 'Approved' ? 'treasury-entry.approved' : 'treasury-entry.declined',
      entityType: 'treasury-entry',
      entityId: entry.id,
      after: { decision: params.decision, reason: params.reason },
    }),
  ]);
  return {
    warnings: params.decision === 'Approved' ? await belowZeroWarnings(db, [entry.accountId]) : [],
  };
}
