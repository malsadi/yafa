import type {
  MatrixGrant,
  PermissionsMatrixView,
} from '../../../../shared/administration-panel/permissions-matrix';
import type { PermissionScope } from '../../../../shared/core/permission-scope';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import {
  getCapabilityDefinition,
  listCapabilityDefinitions,
  type RequestContext,
} from '../../../core/permissions';
import {
  requireCurrentVersion,
  requireMatrixCapability,
  runMatrixBatch,
} from './permissions-matrix-guards';
import {
  buildClearCellStatement,
  buildInsertGrantStatement,
  buildSnapshotStatement,
  buildVersionStatement,
} from './permissions-matrix-statements.repo';
import {
  listGrants,
  listMatrixRoles,
  readCellScopes,
  readCurrentVersionNumber,
} from './permissions-matrix.repo';
import type { SetCellInput } from './permissions-matrix.schema';

/** Brief 25 A3: roles × capabilities × scope, with the fixed rules marked. */
export async function getMatrix(
  db: D1Database,
  ctx: RequestContext,
): Promise<PermissionsMatrixView> {
  await requireMatrixCapability(db, ctx);
  const [version, roles, grants] = await Promise.all([
    readCurrentVersionNumber(db),
    listMatrixRoles(db),
    listGrants(db),
  ]);
  return { version, roles, capabilities: listCapabilityDefinitions(), grants };
}

function checkCell(input: SetCellInput): PermissionScope[] {
  const definition = getCapabilityDefinition(input.capability);
  if (!definition) {
    throw new NotFoundError('permissions-matrix.unknown-capability');
  }
  if (definition.fixedGrants) {
    throw new ConflictError('permissions-matrix.fixed-rule');
  }
  const scopes = [...new Set(input.scopes)] as PermissionScope[];
  if (scopes.some((scope) => !definition.allowedScopes.includes(scope))) {
    throw new ConflictError('permissions-matrix.scope-not-allowed');
  }
  return scopes.sort();
}

function buildCellChange(
  db: D1Database,
  ctx: RequestContext,
  input: SetCellInput,
  state: { current: number; before: string[]; after: PermissionScope[] },
): D1PreparedStatement[] {
  const { roleId, capability } = input;
  const versionId = generateId();
  const number = state.current + 1;
  const change = {
    kind: 'cell',
    roleId,
    capability,
    before: state.before,
    after: state.after,
  } as const;
  const grants: MatrixGrant[] = state.after.map((scope) => ({ roleId, capability, scope }));
  return [
    buildVersionStatement(db, { versionId, number, change, actorPersonId: ctx.personId }),
    buildClearCellStatement(db, roleId, capability),
    ...grants.map((grant) => buildInsertGrantStatement(db, grant)),
    buildSnapshotStatement(db, versionId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'permissions-matrix.cell-changed',
      entityType: 'permission_matrix_version',
      entityId: String(number),
      before: { roleId, capability, scopes: state.before },
      after: { roleId, capability, scopes: state.after },
    }),
  ];
}

/**
 * Sets one cell's scopes as a new version (brief 25 A3, T-078): the change,
 * the version with its full snapshot, and the audit entry in one batch.
 * Fixed rules (brief 7.3) are locked. Returns the version now current.
 */
export async function setCell(
  db: D1Database,
  ctx: RequestContext,
  input: SetCellInput,
): Promise<{ version: number }> {
  await requireMatrixCapability(db, ctx);
  const after = checkCell(input);
  const roles = await listMatrixRoles(db);
  if (!roles.some((role) => role.id === input.roleId)) {
    throw new NotFoundError('permissions-matrix.unknown-role');
  }
  const current = await readCurrentVersionNumber(db);
  requireCurrentVersion(current, input.expectedVersion);
  const before = await readCellScopes(db, input.roleId, input.capability);
  if (before.join() === after.join()) {
    return { version: current };
  }
  await runMatrixBatch(db, buildCellChange(db, ctx, input, { current, before, after }));
  return { version: current + 1 };
}
