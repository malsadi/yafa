import type {
  MatrixChange,
  MatrixGrant,
} from '../../../../shared/administration-panel/permissions-matrix';
import { generateId } from '../../../core/ids';

/**
 * The writes of one matrix change, for one D1 batch (T-078). The version
 * row goes first: the database refuses it unless its number is the next in
 * sequence (migration 0013), which fails the whole batch on a stale edit.
 */
export function buildVersionStatement(
  db: D1Database,
  params: { versionId: string; number: number; change: MatrixChange; actorPersonId: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO permission_matrix_versions (id, number, change, created_at, created_by)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      params.versionId,
      params.number,
      JSON.stringify(params.change),
      new Date().toISOString(),
      params.actorPersonId,
    );
}

export function buildClearCellStatement(
  db: D1Database,
  roleId: string,
  capability: string,
): D1PreparedStatement {
  return db
    .prepare('DELETE FROM permission_grants WHERE role_id = ? AND capability = ?')
    .bind(roleId, capability);
}

export function buildClearAllGrantsStatement(db: D1Database): D1PreparedStatement {
  return db.prepare('DELETE FROM permission_grants');
}

export function buildInsertGrantStatement(db: D1Database, grant: MatrixGrant): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO permission_grants (id, role_id, capability, scope, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(generateId(), grant.roleId, grant.capability, grant.scope, new Date().toISOString());
}

/** Copies the live grants, as they stand after the change, into the version. */
export function buildSnapshotStatement(db: D1Database, versionId: string): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO permission_matrix_version_grants (version_id, role_id, capability, scope)
       SELECT ?, role_id, capability, scope FROM permission_grants`,
    )
    .bind(versionId);
}
