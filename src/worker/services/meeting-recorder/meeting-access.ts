import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type MeetingUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

/** The unit, where the Meeting recorder is on; switched off, it is hidden (8.4). */
export async function requireMeetingUnit(db: D1Database, unitId: string): Promise<MeetingUnitRow> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'meeting-recorder', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** An officer holding `capability` in the unit, where the Meeting recorder is on. */
export async function requireMeetingCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<MeetingUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireMeetingUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: MeetingUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}

/** Runs a meeting batch; a save from an older version, or a locked meeting, is refused (9.1). */
export async function runMeetingBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale'))
      throw new ConflictError('meeting-recorder.stale');
    if (error instanceof Error && error.message.includes('locked'))
      throw new ConflictError('meeting-recorder.locked');
    throw error;
  }
}
