import { asc, eq, isNull, or, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { roles } from '../../../../db/schema/committee-register/roles';
import type { RenameRoleInput, RoleRecord } from './roles.schema';

const COLUMNS = {
  id: roles.id,
  unitId: roles.unitId,
  nameEn: roles.nameEn,
  nameAr: roles.nameAr,
  designation: roles.designation,
};

/**
 * The standard roles, or with `unitId`, the standard roles plus that branch's
 * own. Standard roles come in the national register officer's order (D-071),
 * then the branch's own, in the order they were added.
 */
export async function listRoles(db: D1Database, unitId?: string): Promise<RoleRecord[]> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(roles)
    .where(unitId ? or(isNull(roles.unitId), eq(roles.unitId, unitId)) : isNull(roles.unitId))
    .orderBy(
      sql`CASE WHEN ${roles.unitId} IS NULL THEN 0 ELSE 1 END`,
      asc(roles.position),
      asc(roles.createdAt),
    );
  return rows as RoleRecord[];
}

export async function findRole(db: D1Database, roleId: string): Promise<RoleRecord | null> {
  const rows = await drizzle(db).select(COLUMNS).from(roles).where(eq(roles.id, roleId)).limit(1);
  return (rows[0] as RoleRecord | undefined) ?? null;
}

/** A new standard role goes last in the order, worked out in SQL (D-071); a branch's own has none. */
export function buildInsertRoleStatement(db: D1Database, role: RoleRecord): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO roles (id, unit_id, name_en, name_ar, position, created_at)
       VALUES (?, ?, ?, ?, CASE WHEN ? IS NULL
         THEN (SELECT COALESCE(MAX(position), 0) + 1 FROM roles WHERE unit_id IS NULL) END, ?)`,
    )
    .bind(role.id, role.unitId, role.nameEn, role.nameAr, role.unitId, new Date().toISOString());
}

export function buildRolePositionStatement(
  db: D1Database,
  roleId: string,
  position: number,
): D1PreparedStatement {
  return db.prepare('UPDATE roles SET position = ? WHERE id = ?').bind(position, roleId);
}

export function buildRenameRoleStatement(
  db: D1Database,
  role: RoleRecord,
  changes: RenameRoleInput,
): D1PreparedStatement {
  return db
    .prepare('UPDATE roles SET name_en = ?, name_ar = ? WHERE id = ?')
    .bind(changes.nameEn ?? role.nameEn, changes.nameAr ?? role.nameAr, role.id);
}
