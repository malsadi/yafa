import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError, ServiceUnavailableError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { requireActiveBranch, requireCapability } from '../committee-register-guards';
import { requireUniqueRoleNames } from './role-names';
import {
  buildInsertRoleStatement,
  buildRenameRoleStatement,
  findRole,
  listRoles,
} from './roles.repo';
import type { CreateRoleInput, RenameRoleInput, RoleRecord } from './roles.schema';

// Brief 14 "Who does what": a branch register officer for their own branch,
// the national register officer for every branch (fixed, T-075).
const CAPABILITY = 'committee-register.branch-roles.manage';
const SETTING = 'committee-register.branches_may_add_roles';

/** Brief 14 B2: the roles a branch can use, standard and its own. */
export async function listBranchRoles(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<RoleRecord[]> {
  await requireCapability(db, ctx, CAPABILITY, { unitId });
  return listRoles(db, unitId);
}

/**
 * Brief 14 B2 and 25 B2: add a branch's own role, when the administrator
 * has allowed it; until they have, the action waits (rule 5).
 */
export async function createBranchRole(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: CreateRoleInput,
): Promise<RoleRecord> {
  await requireCapability(db, ctx, CAPABILITY, { unitId });
  const allowed = await getSetting<boolean>(db, SETTING);
  if (allowed.status === 'not-configured') {
    throw new ServiceUnavailableError('setting.not-configured');
  }
  if (!allowed.value) {
    throw new ConflictError('roles.branch-roles-not-allowed');
  }
  await requireActiveBranch(db, unitId);
  requireUniqueRoleNames(await listRoles(db, unitId), input);
  const role: RoleRecord = { id: generateId(), unitId, designation: null, ...input };
  await db.batch([
    buildInsertRoleStatement(db, role),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'role.created',
      entityType: 'role',
      entityId: role.id,
      after: role,
    }),
  ]);
  return role;
}

export async function renameBranchRole(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; roleId: string; changes: RenameRoleInput },
): Promise<RoleRecord> {
  await requireCapability(db, ctx, CAPABILITY, { unitId: params.unitId });
  const role = await findRole(db, params.roleId);
  if (role?.unitId !== params.unitId) {
    throw new NotFoundError('roles.not-found');
  }
  await requireActiveBranch(db, params.unitId);
  const after: RoleRecord = { ...role, ...params.changes };
  requireUniqueRoleNames(await listRoles(db, params.unitId), after, role.id);
  await db.batch([
    buildRenameRoleStatement(db, role, params.changes),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'role.renamed',
      entityType: 'role',
      entityId: role.id,
      before: role,
      after,
    }),
  ]);
  return after;
}
