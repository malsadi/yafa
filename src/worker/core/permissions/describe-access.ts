import { isAdministrationPanelCapability } from '../../../shared/core/administration-panel-capability';
import { PermissionScope } from '../../../shared/core/permission-scope';
import { listCapabilityDefinitions } from './capability-catalogue';
import { grantsForDefinition } from './grants-for-definition';
import { isSystemAdministrator } from './system-administrators-repo';
import { getTodayInLondon } from './today-in-london';

export interface AccessGrant {
  capability: string;
  scope: PermissionScope;
  /** The unit of the term that gives it; null when it isn't a term's. */
  unitId: string | null;
  source: 'matrix' | 'fixed rule' | 'system administrator';
}

/**
 * Brief 25 A4: exactly which capabilities and scopes a person holds today —
 * worked out by the same rules `can()` applies (D-046, T-042, T-048,
 * T-074), so the access check can never disagree with what the portal
 * actually allows. Permissions only, never the person's data.
 */
export async function describeAccess(db: D1Database, personId: string): Promise<AccessGrant[]> {
  const today = getTodayInLondon();
  const systemAdmin = await isSystemAdministrator(db, personId);
  const grants: AccessGrant[] = [];
  for (const definition of listCapabilityDefinitions()) {
    if (systemAdmin && isAdministrationPanelCapability(definition.capability)) {
      grants.push({
        capability: definition.capability,
        scope: PermissionScope.AllUnits,
        unitId: null,
        source: 'system administrator',
      });
      continue;
    }
    const source = definition.fixedGrants ? 'fixed rule' : 'matrix';
    for (const grant of await grantsForDefinition(db, definition, personId, today)) {
      grants.push({
        capability: definition.capability,
        scope: grant.scope,
        unitId: grant.unitId,
        source,
      });
    }
  }
  return grants;
}
