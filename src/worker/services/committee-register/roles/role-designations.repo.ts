import type { RoleDesignation } from '../../../../shared/committee-register/role-designation';

/**
 * The writes that give `designation` to one standard role, or to none
 * (brief 7.2, 25 B2): clear it from whichever role holds it, then set it.
 * One batch; the unique index (migration 0010) backs "one role each".
 */
export function buildSetDesignationStatements(
  db: D1Database,
  designation: RoleDesignation,
  roleId: string | null,
): D1PreparedStatement[] {
  const clear = db
    .prepare('UPDATE roles SET designation = NULL WHERE designation = ?')
    .bind(designation);
  if (!roleId) {
    return [clear];
  }
  return [
    clear,
    db
      .prepare('UPDATE roles SET designation = ? WHERE id = ? AND unit_id IS NULL')
      .bind(designation, roleId),
  ];
}
