import { and, eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { terms } from '../../../db/schema/committee-register/terms';
import { permissionGrants } from '../../../db/schema/core/permission-grants';
import { PermissionScope } from '../../../shared/core/permission-scope';
import { listCapabilityDefinitions } from './capability-catalogue';
import { currentTermCondition } from './current-term-condition';

/** The capabilities granted unit by unit in the matrix: own unit, or (D-221) all units. */
function unitCapabilities(): string[] {
  return listCapabilityDefinitions()
    .filter(
      (d) =>
        !d.fixedGrants &&
        d.allowedScopes.includes(PermissionScope.OwnUnit) &&
        d.allowedScopes.includes(PermissionScope.AllUnits),
    )
    .map((d) => d.capability);
}

/**
 * D-221: whether a current term's role holds any unit-by-unit capability for
 * all units, so the person works in every unit, not only their own. A UI
 * hint only (T-042): which units the switcher offers. `can()` decides each
 * request itself.
 */
export async function reachesAllUnits(
  db: D1Database,
  personId: string,
  today: string,
): Promise<boolean> {
  const capabilities = unitCapabilities();
  if (capabilities.length === 0) return false;
  const rows = await drizzle(db)
    .select({ capability: permissionGrants.capability })
    .from(terms)
    .innerJoin(permissionGrants, eq(permissionGrants.roleId, terms.roleId))
    .where(
      and(
        currentTermCondition(personId, today),
        eq(permissionGrants.scope, PermissionScope.AllUnits),
        inArray(permissionGrants.capability, capabilities),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
