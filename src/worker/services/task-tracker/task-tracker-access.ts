import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type TaskUnit = Awaited<ReturnType<typeof listUnits>>[number];

/** The unit, which must exist, with the Task tracker switched on for it: off, it is hidden (8.4). */
export async function requireTaskUnit(db: D1Database, unitId: string): Promise<TaskUnit> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'task-tracker', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** An officer holding `capability` in the unit (D-141: own unit only), where the Task tracker is on. */
export async function requireTaskCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<TaskUnit> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireTaskUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: TaskUnit): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}
