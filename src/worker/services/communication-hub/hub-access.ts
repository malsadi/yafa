import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type HubUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

/** An officer holding `capability` in the unit, where the hub is on; switched off, it is hidden (8.4). */
export async function requireHubCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<HubUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'communication-hub', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: HubUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}

/** Runs a batch, turning the database's refusals into the portal's (9.1; D-155; P12). */
export async function runHubBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('stale')) throw new ConflictError('communication-hub.stale');
    if (message.includes('vote locked')) throw new ConflictError('communication-hub.vote-locked');
    if (message.includes('vote closed')) throw new ConflictError('communication-hub.vote-closed');
    if (message.includes('UNIQUE constraint failed: notice_ballots'))
      throw new ConflictError('communication-hub.already-voted');
    throw error;
  }
}

/**
 * D-157: a current officer of the unit — no capability — where the hub is
 * on; anyone else is refused, and switched off, the hub is hidden (8.4).
 */
export async function requireHubOfficer(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<HubUnitRow> {
  if (!ctx.units.includes(unitId)) throw new ForbiddenError('permission.denied');
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'communication-hub', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}
