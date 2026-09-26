import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type CalendarUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

/** An officer holding `capability` in the unit, where the Calendar is on; switched off, it is hidden (8.4). */
export async function requireCalendarCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<CalendarUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'calendar', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: CalendarUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}
