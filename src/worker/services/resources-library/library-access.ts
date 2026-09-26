import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

type Unit = Awaited<ReturnType<typeof listUnits>>[number];

/** The unit, which must exist, with the library switched on for it: a switched-off service is hidden (8.4). */
export async function requireLibraryUnit(db: D1Database, unitId: string): Promise<Unit> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'resources-library', unitId))) {
    throw new NotFoundError('service.switched-off');
  }
  return unit;
}

/** An officer holding `capability` in the unit, where the library is on. */
export async function requireLibraryCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<Unit> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireLibraryUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: Unit): void {
  if (unit.type === 'branch' && unit.status !== 'active') {
    throw new ConflictError('branches.inactive');
  }
}

/**
 * Brief 16 A3, D1 and 7.3: the units whose shared material a unit sees —
 * its own, and the General Council's, which is shared with every branch.
 */
export async function sharedWith(db: D1Database, unit: Unit): Promise<string[]> {
  const national = (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id);
  return [...new Set([unit.id, ...national])];
}
