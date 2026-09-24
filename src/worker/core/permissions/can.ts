import { isAdministrationPanelCapability } from '../../../shared/core/administration-panel-capability';
import { PermissionScope } from '../../../shared/core/permission-scope';
import { getCapabilityDefinition } from './capability-catalogue';
import { isNationalUnit } from './national-unit-repo';
import { grantsForDefinition } from './grants-for-definition';
import type { RequestContext } from './request-context';
import { resolveScope } from './resolve-scope';
import { isSystemAdministrator } from './system-administrators-repo';
import { getTodayInLondon } from './today-in-london';

/**
 * The unit the action is on, or `portalWide` for an action on no one unit
 * (the Administration panel, brief 25), which only an `all units` grant
 * covers.
 */
export type CanParams = { unitId: string } | { portalWide: true };

/**
 * The one authoritative permission check (brief section 7.2): does
 * `ctx.personId` currently hold `capability` at a scope that covers
 * `params.unitId` (or, for `portalWide`, at `all units`)? Re-derives everything from `ctx.personId` on every call —
 * never trusts `ctx.capabilities`/`ctx.units` (T-042). Throws on a
 * capability that isn't in the catalogue, so a typo cannot look like a
 * working deny (mirrors `getSetting`'s behaviour for an unregistered key).
 * A grant stored at a scope the capability's own catalogue entry doesn't
 * allow (a matrix-editor bug — the matrix itself is data) is ignored here
 * too, not trusted just because it exists in the table (T-048).
 *
 * D-046: a current system administrator holds every Administration panel
 * capability portal-wide, whatever the matrix says — re-checked in the
 * table, never taken from `ctx.isSystemAdmin`. It gives nothing else: every
 * other capability still needs a matrix grant (P22). A fixed capability
 * (brief 7.3) is held only through a designated role (`grantsForDefinition`).
 */
export async function can(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  params: CanParams,
): Promise<boolean> {
  const definition = getCapabilityDefinition(capability);
  if (!definition) {
    throw new Error(`Capability is not registered: ${capability}`);
  }

  if (
    isAdministrationPanelCapability(capability) &&
    (await isSystemAdministrator(db, ctx.personId))
  ) {
    return true;
  }

  const today = getTodayInLondon();
  const grants = await grantsForDefinition(db, definition, ctx.personId, today);
  if (grants.length === 0) {
    return false;
  }

  if ('portalWide' in params) {
    return grants.some((grant) => grant.scope === PermissionScope.AllUnits);
  }

  const needsNationalCheck = grants.some(
    (grant) => grant.scope === PermissionScope.NationalContent,
  );
  const isRequestedUnitNational = needsNationalCheck
    ? await isNationalUnit(db, params.unitId)
    : false;

  return grants.some((grant) => resolveScope(grant, params.unitId, isRequestedUnitNational));
}
