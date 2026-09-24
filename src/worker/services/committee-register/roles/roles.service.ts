import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireCapability } from '../committee-register-guards';
import { requireUniqueRoleNames } from './role-names';
import {
  buildInsertRoleStatement,
  buildRenameRoleStatement,
  findRole,
  listRoles,
} from './roles.repo';
import type { CreateRoleInput, RenameRoleInput, RoleRecord } from './roles.schema';

// Brief 7.3 and 14: the national register officer alone maintains the
// standard roles (fixed, T-075).
const CAPABILITY = 'committee-register.standard-roles.manage';

/** Brief 14 B2 and 25 B2: the standard national roles. */
export async function listStandardRoles(
  db: D1Database,
  ctx: RequestContext,
): Promise<RoleRecord[]> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  return listRoles(db);
}

export async function createStandardRole(
  db: D1Database,
  ctx: RequestContext,
  input: CreateRoleInput,
): Promise<RoleRecord> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  requireUniqueRoleNames(await listRoles(db), input);
  const role: RoleRecord = { id: generateId(), unitId: null, designation: null, ...input };
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

export async function renameStandardRole(
  db: D1Database,
  ctx: RequestContext,
  roleId: string,
  changes: RenameRoleInput,
): Promise<RoleRecord> {
  await requireCapability(db, ctx, CAPABILITY, { portalWide: true });
  const role = await findRole(db, roleId);
  if (role?.unitId !== null) {
    throw new NotFoundError('roles.not-found');
  }
  const after: RoleRecord = { ...role, ...changes };
  requireUniqueRoleNames(await listRoles(db), after, roleId);
  await db.batch([
    buildRenameRoleStatement(db, role, changes),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'role.renamed',
      entityType: 'role',
      entityId: roleId,
      before: role,
      after,
    }),
  ]);
  return after;
}
