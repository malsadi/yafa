import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { terms } from '../../../db/schema/committee-register/terms';
import { permissionGrants } from '../../../db/schema/core/permission-grants';
import type { PermissionScope } from '../../../shared/core/permission-scope';
import { currentTermCondition } from './current-term-condition';

export interface GrantForCapability {
  unitId: string;
  scope: PermissionScope;
}

/** Every current-term grant of one capability, with the unit of the granting term (T-042). */
export async function findGrantsForCapability(
  db: D1Database,
  personId: string,
  capability: string,
  today: string,
): Promise<GrantForCapability[]> {
  const orm = drizzle(db);
  return orm
    .select({ unitId: terms.unitId, scope: permissionGrants.scope })
    .from(terms)
    .innerJoin(permissionGrants, eq(permissionGrants.roleId, terms.roleId))
    .where(and(currentTermCondition(personId, today), eq(permissionGrants.capability, capability)));
}

/**
 * Every capability granted to any of a person's current-term roles,
 * flattened across units. Not authoritative (T-042): the request context's
 * UI hint only — `can()` never reads this.
 */
export async function findAllCapabilitiesForCurrentTerms(
  db: D1Database,
  personId: string,
  today: string,
): Promise<string[]> {
  const orm = drizzle(db);
  const rows = await orm
    .selectDistinct({ capability: permissionGrants.capability })
    .from(terms)
    .innerJoin(permissionGrants, eq(permissionGrants.roleId, terms.roleId))
    .where(currentTermCondition(personId, today));

  return rows.map((row) => row.capability);
}
