import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireCapability } from '../committee-register-guards';
import { buildRolePositionStatement, listRoles } from './roles.repo';

// Brief 7.3 and 14: the national register officer maintains the standard roles.
const CAPABILITY = 'committee-register.standard-roles.manage';

/**
 * D-071: put the standard roles in the national register officer's order.
 * `roleIds` must name every standard role exactly once.
 */
export async function orderStandardRoles(
  db: D1Database,
  ctx: RequestContext,
  roleIds: string[],
): Promise<void> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  const standard = await listRoles(db);
  const known = new Set(standard.map((role) => role.id));
  const given = new Set(roleIds);
  if (
    given.size !== roleIds.length ||
    given.size !== known.size ||
    ![...given].every((id) => known.has(id))
  ) {
    throw new ConflictError('roles.order-must-name-every-role');
  }
  await db.batch([
    ...roleIds.map((id, index) => buildRolePositionStatement(db, id, index + 1)),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'standard-roles.ordered',
      entityType: 'roles',
      entityId: 'standard',
      before: standard.map((role) => role.id),
      after: roleIds,
    }),
  ]);
}
