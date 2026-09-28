import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type AchievementUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

export const READ = 'achievements-and-reports.achievements.read';
export const RECORD = 'achievements-and-reports.achievements.record';
export const MANAGE = 'achievements-and-reports.annual-report.manage';
const SERVICE = 'achievements-and-reports';

/** The unit, where Achievements and reports is on; switched off, it is hidden (8.4). */
export async function requireAchievementUnit(
  db: D1Database,
  unitId: string,
): Promise<AchievementUnitRow> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, SERVICE, unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** An officer holding `capability` in the unit, where the service is on. */
export async function requireAchievementCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<AchievementUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireAchievementUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: AchievementUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}

/**
 * D-215 (O-150): the units whose achievements a reader of `unit` sees — its
 * own and the General Council's; from the General Council, every unit's.
 * A unit where the service is switched off shows none (8.4).
 */
export async function visibleUnitIds(db: D1Database, unit: AchievementUnitRow): Promise<string[]> {
  const units = await listUnits(db);
  const candidates =
    unit.type === 'national'
      ? units
      : units.filter((u) => u.id === unit.id || u.type === 'national');
  const on = await Promise.all(candidates.map((u) => isServiceEnabled(db, SERVICE, u.id)));
  return candidates.filter((_, i) => on[i]).map((u) => u.id);
}

/** Runs an achievements batch, turning the database's refusals into the portal's (9.1). */
export async function runAchievementBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('stale')) throw new ConflictError('achievements-and-reports.stale');
    if (message.includes('locked')) throw new ConflictError('achievements-and-reports.locked');
    throw error;
  }
}
