import { and, asc, eq, max } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../../db/schema/committee-register/people';
import { roles } from '../../../../db/schema/committee-register/roles';
import { permissionGrants } from '../../../../db/schema/core/permission-grants';
import {
  permissionMatrixVersionGrants,
  permissionMatrixVersions,
} from '../../../../db/schema/core/permission-matrix-versions';
import type {
  MatrixChange,
  MatrixGrant,
  MatrixRole,
  MatrixVersionSummary,
} from '../../../../shared/administration-panel/permissions-matrix';

export async function readCurrentVersionNumber(db: D1Database): Promise<number> {
  const rows = await drizzle(db)
    .select({ latest: max(permissionMatrixVersions.number) })
    .from(permissionMatrixVersions);
  return rows[0]?.latest ?? 0;
}

export async function listMatrixRoles(db: D1Database): Promise<MatrixRole[]> {
  const rows = await drizzle(db)
    .select({
      id: roles.id,
      unitId: roles.unitId,
      nameEn: roles.nameEn,
      nameAr: roles.nameAr,
      designation: roles.designation,
    })
    .from(roles)
    .orderBy(asc(roles.nameEn));
  return rows as MatrixRole[];
}

export async function listGrants(db: D1Database): Promise<MatrixGrant[]> {
  return drizzle(db)
    .select({
      roleId: permissionGrants.roleId,
      capability: permissionGrants.capability,
      scope: permissionGrants.scope,
    })
    .from(permissionGrants);
}

export async function readCellScopes(
  db: D1Database,
  roleId: string,
  capability: string,
): Promise<string[]> {
  const rows = await drizzle(db)
    .select({ scope: permissionGrants.scope })
    .from(permissionGrants)
    .where(and(eq(permissionGrants.roleId, roleId), eq(permissionGrants.capability, capability)));
  return rows.map((row) => row.scope).sort();
}

export async function listVersions(db: D1Database): Promise<MatrixVersionSummary[]> {
  const rows = await drizzle(db)
    .select({
      number: permissionMatrixVersions.number,
      createdAt: permissionMatrixVersions.createdAt,
      createdByEmail: people.email,
      change: permissionMatrixVersions.change,
    })
    .from(permissionMatrixVersions)
    .innerJoin(people, eq(people.id, permissionMatrixVersions.createdBy))
    .orderBy(asc(permissionMatrixVersions.number));
  return rows.map((row) => ({ ...row, change: JSON.parse(row.change) as MatrixChange }));
}

/** An earlier version's snapshot, or null if there is no such version. */
export async function readVersionSnapshot(
  db: D1Database,
  number: number,
): Promise<{ id: string; grants: MatrixGrant[] } | null> {
  const orm = drizzle(db);
  const version = await orm
    .select({ id: permissionMatrixVersions.id })
    .from(permissionMatrixVersions)
    .where(eq(permissionMatrixVersions.number, number))
    .limit(1);
  const id = version[0]?.id;
  if (!id) return null;
  const grants = await orm
    .select({
      roleId: permissionMatrixVersionGrants.roleId,
      capability: permissionMatrixVersionGrants.capability,
      scope: permissionMatrixVersionGrants.scope,
    })
    .from(permissionMatrixVersionGrants)
    .where(eq(permissionMatrixVersionGrants.versionId, id));
  return { id, grants: grants as MatrixGrant[] };
}
