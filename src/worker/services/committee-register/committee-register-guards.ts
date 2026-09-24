import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type CanParams, type RequestContext } from '../../core/permissions';
import { findUnit } from './branches/branches.repo';
import type { UnitRecord } from './branches/branches.schema';

export async function requireCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  params: CanParams,
): Promise<void> {
  if (!(await can(db, ctx, capability, params))) {
    throw new ForbiddenError('permission.denied');
  }
}

/**
 * A branch that can take new records: it exists, and is active — P4, an
 * inactive branch is read-only everywhere.
 */
export async function requireActiveBranch(db: D1Database, unitId: string): Promise<UnitRecord> {
  const unit = await findUnit(db, unitId);
  if (unit?.type !== 'branch') {
    throw new NotFoundError('branches.not-found');
  }
  if (unit.status !== 'active') {
    throw new ConflictError('branches.inactive');
  }
  return unit;
}

/**
 * A unit whose register can take changes: the General Council, or an
 * active branch (P4: an inactive branch is read-only everywhere).
 */
export async function requireWritableUnit(db: D1Database, unitId: string): Promise<UnitRecord> {
  const unit = await findUnit(db, unitId);
  if (!unit) {
    throw new NotFoundError('branches.not-found');
  }
  if (unit.type === 'branch' && unit.status !== 'active') {
    throw new ConflictError('branches.inactive');
  }
  return unit;
}

/** Reading a unit's register: its readers, and whoever manages it. */
export async function requireRegisterReader(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<void> {
  const reads = await can(db, ctx, 'committee-register.register.read', { unitId });
  if (!reads && !(await can(db, ctx, 'committee-register.officers.manage', { unitId }))) {
    throw new ForbiddenError('permission.denied');
  }
}
