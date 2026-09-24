import { asc, eq, isNull, or } from 'drizzle-orm';
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

/** The standard roles, or with `unitId`, the standard roles plus that branch's own. */
export async function listRoles(db: D1Database, unitId?: string): Promise<RoleRecord[]> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(roles)
    .where(unitId ? or(isNull(roles.unitId), eq(roles.unitId, unitId)) : isNull(roles.unitId))
    .orderBy(asc(roles.nameEn));
  return rows as RoleRecord[];
}

export async function findRole(db: D1Database, roleId: string): Promise<RoleRecord | null> {
  const rows = await drizzle(db).select(COLUMNS).from(roles).where(eq(roles.id, roleId)).limit(1);
  return (rows[0] as RoleRecord | undefined) ?? null;
}

export function buildInsertRoleStatement(db: D1Database, role: RoleRecord): D1PreparedStatement {
  return db
    .prepare('INSERT INTO roles (id, unit_id, name_en, name_ar, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(role.id, role.unitId, role.nameEn, role.nameAr, new Date().toISOString());
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
