import type { MatrixVersionSummary } from '../../../../shared/administration-panel/permissions-matrix';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getCapabilityDefinition, type RequestContext } from '../../../core/permissions';
import {
  requireCurrentVersion,
  requireMatrixCapability,
  runMatrixBatch,
} from './permissions-matrix-guards';
import {
  buildClearAllGrantsStatement,
  buildInsertGrantStatement,
  buildSnapshotStatement,
  buildVersionStatement,
} from './permissions-matrix-statements.repo';
import {
  listVersions,
  readCurrentVersionNumber,
  readVersionSnapshot,
} from './permissions-matrix.repo';

/** Brief 25 A3: every version of the matrix, oldest first. */
export async function listMatrixVersions(
  db: D1Database,
  ctx: RequestContext,
): Promise<MatrixVersionSummary[]> {
  await requireMatrixCapability(db, ctx);
  return listVersions(db);
}

/**
 * Restores an earlier version (brief 25 A3, T-078) as a new version, so
 * nothing is lost. Only grants the catalogue still knows, and never a fixed
 * rule (brief 7.3), are brought back.
 */
export async function restoreMatrixVersion(
  db: D1Database,
  ctx: RequestContext,
  params: { fromVersion: number; expectedVersion: number },
): Promise<{ version: number }> {
  await requireMatrixCapability(db, ctx);
  const snapshot = await readVersionSnapshot(db, params.fromVersion);
  if (!snapshot) {
    throw new NotFoundError('permissions-matrix.unknown-version');
  }
  const current = await readCurrentVersionNumber(db);
  requireCurrentVersion(current, params.expectedVersion);
  const grants = snapshot.grants.filter((grant) => {
    const definition = getCapabilityDefinition(grant.capability);
    return definition && !definition.fixedGrants && definition.allowedScopes.includes(grant.scope);
  });
  const versionId = generateId();
  await runMatrixBatch(db, [
    buildVersionStatement(db, {
      versionId,
      number: current + 1,
      change: { kind: 'restore', fromVersion: params.fromVersion },
      actorPersonId: ctx.personId,
    }),
    buildClearAllGrantsStatement(db),
    ...grants.map((grant) => buildInsertGrantStatement(db, grant)),
    buildSnapshotStatement(db, versionId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'permissions-matrix.restored',
      entityType: 'permission_matrix_version',
      entityId: String(current + 1),
      after: { fromVersion: params.fromVersion },
    }),
  ]);
  return { version: current + 1 };
}
