import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type TreasuryUnit = Awaited<ReturnType<typeof listUnits>>[number];

/**
 * An officer holding `capability` in the unit (D-132: own unit only), where
 * the Treasury is switched on; switched off, it is hidden (8.4).
 */
export async function requireTreasuryCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<TreasuryUnit> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'treasury', unitId))) {
    throw new NotFoundError('service.switched-off');
  }
  return unit;
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: TreasuryUnit): void {
  if (unit.type === 'branch' && unit.status !== 'active') {
    throw new ConflictError('branches.inactive');
  }
}

/** A change to the unit's Treasury: the capability, the switch, and a unit that can take changes. */
export async function requireTreasuryWriter(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<TreasuryUnit> {
  const unit = await requireTreasuryCapability(db, ctx, capability, unitId);
  requireWritable(unit);
  return unit;
}
