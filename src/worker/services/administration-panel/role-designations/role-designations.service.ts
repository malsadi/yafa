import type { RoleDesignationsView } from '../../../../shared/administration-panel/role-designations';
import { ROLE_DESIGNATIONS } from '../../../../shared/committee-register/role-designation';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { buildSetDesignationStatements, findRole, listRoles } from '../../committee-register';
import type { SetDesignationInput } from './role-designations.schema';

const CAPABILITY = 'administration-panel.role-designations.manage';

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** Brief 7.2 and 25 B2: which standard role holds each designation. */
export async function getRoleDesignations(
  db: D1Database,
  ctx: RequestContext,
): Promise<RoleDesignationsView> {
  await requireCapability(db, ctx);
  const standardRoles = await listRoles(db);
  return {
    designations: ROLE_DESIGNATIONS.map((designation) => ({
      designation,
      roleId: standardRoles.find((role) => role.designation === designation)?.id ?? null,
    })),
    standardRoles,
  };
}

/**
 * Brief 25 B2: give a designation to one standard role, or to none. A role
 * holds at most one designation. Changes who holds the fixed register
 * powers (brief 7.3) at once, so it is audited with before and after.
 */
export async function setRoleDesignation(
  db: D1Database,
  ctx: RequestContext,
  input: SetDesignationInput,
): Promise<void> {
  await requireCapability(db, ctx);
  const standardRoles = await listRoles(db);
  const before = standardRoles.find((role) => role.designation === input.designation)?.id ?? null;
  if (input.roleId) {
    const role = await findRole(db, input.roleId);
    if (role?.unitId !== null) {
      throw new NotFoundError('role-designations.standard-role-not-found');
    }
    if (role.designation && role.designation !== input.designation) {
      throw new ConflictError('role-designations.role-already-designated');
    }
  }
  await db.batch([
    ...buildSetDesignationStatements(db, input.designation, input.roleId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'role-designation.changed',
      entityType: 'role_designation',
      entityId: input.designation,
      before: { roleId: before },
      after: { roleId: input.roleId },
    }),
  ]);
}
