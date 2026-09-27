import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type EventUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

/** The unit, where the Event organiser is on; switched off, it is hidden (8.4). */
export async function requireEventUnit(db: D1Database, unitId: string): Promise<EventUnitRow> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'event-organiser', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** An officer holding `capability` in the unit, where the Event organiser is on. */
export async function requireEventCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<EventUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireEventUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: EventUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}

/** Runs an event batch; a save made from an older version is refused (9.1). */
export async function runEventBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale'))
      throw new ConflictError('event-organiser.stale');
    if (error instanceof Error && error.message.includes('closed event is locked'))
      throw new ConflictError('event-organiser.locked');
    throw error;
  }
}
