import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import {
  requireCalendarCapability,
  requireWritable,
  type CalendarUnitRow,
} from '../calendar-access';
import {
  buildInsertCommunityDateStatement,
  buildUpdateCommunityDateStatement,
  findCommunityDate,
} from './community-dates.repo';
import type { CommunityDateInput } from './community-dates.schema';

export const MANAGE = 'calendar.community-dates.manage';

/** D-146: only the General Council's dates can be for all branches (a trigger also refuses). */
function requireAllBranchesAllowed(unit: CalendarUnitRow, input: CommunityDateInput): void {
  if (input.forAllBranches && unit.type !== 'national')
    throw new ConflictError('calendar.all-branches-general-council-only');
}

/** A managing officer, in a unit that can take changes (P4). */
async function requireManager(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<CalendarUnitRow> {
  const unit = await requireCalendarCapability(db, ctx, MANAGE, unitId);
  requireWritable(unit);
  return unit;
}

/** A community date of this unit's; another unit's is not found. */
export async function requireUnitDate(db: D1Database, unitId: string, id: string) {
  const row = await findCommunityDate(db, id);
  if (row?.unitId !== unitId) throw new NotFoundError('calendar.community-date-not-found');
  return row;
}

/** Runs a community date's batch; a save made from an older version is refused (9.1). */
export async function runDateBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale'))
      throw new ConflictError('calendar.stale');
    throw error;
  }
}

/** Brief 19 A3 and D-145, D-146: add a community date to the unit's calendar — or, for the General Council, every branch's. */
export async function addCommunityDate(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: CommunityDateInput,
): Promise<{ id: string }> {
  const unit = await requireManager(db, ctx, unitId);
  requireAllBranchesAllowed(unit, input);
  const row = {
    ...input,
    id: generateId(),
    unitId,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await runDateBatch(db, [
    buildInsertCommunityDateStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'community-date.added',
      entityType: 'community-date',
      entityId: row.id,
      after: input,
    }),
  ]);
  return { id: row.id };
}

/** Brief 19 A3: change a community date, from the version read (9.1). */
export async function changeCommunityDate(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; id: string; version: number; date: CommunityDateInput },
): Promise<void> {
  const unit = await requireManager(db, ctx, params.unitId);
  requireAllBranchesAllowed(unit, params.date);
  await requireUnitDate(db, unit.id, params.id);
  await runDateBatch(db, [
    buildUpdateCommunityDateStatement(db, {
      id: params.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      date: params.date,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'community-date.changed',
      entityType: 'community-date',
      entityId: params.id,
      after: params.date,
    }),
  ]);
}

/** D-147: retire a community date — hidden, kept — or bring it back. */
export async function setCommunityDateRetired(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; id: string; version: number; retire: boolean },
): Promise<void> {
  const unit = await requireManager(db, ctx, params.unitId);
  const row = await requireUnitDate(db, unit.id, params.id);
  if (params.retire === (row.retiredAt !== null)) {
    throw new ConflictError(params.retire ? 'calendar.already-retired' : 'calendar.not-retired');
  }
  const at = new Date().toISOString();
  await runDateBatch(db, [
    buildUpdateCommunityDateStatement(db, {
      id: row.id,
      version: params.version,
      actor: ctx.personId,
      at,
      retiredAt: params.retire ? at : null,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: params.retire ? 'community-date.retired' : 'community-date.restored',
      entityType: 'community-date',
      entityId: row.id,
    }),
  ]);
}
