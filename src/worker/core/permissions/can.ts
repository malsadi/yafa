import { PermissionScope } from '../../../shared/core/permission-scope';
import { getCapabilityDefinition } from './capability-catalogue';
import { findNationalUnitId } from './national-unit-repo';
import { findGrantsForCapability } from './permission-grants-repo';
import type { RequestContext } from './request-context';
import { resolveScope } from './resolve-scope';
import { getTodayInLondon } from './today-in-london';

export interface CanParams {
  unitId: string;
}

/**
 * The one authoritative permission check (brief section 7.2): does
 * `ctx.personId` currently hold `capability` at a scope that covers
 * `params.unitId`? Re-derives everything from `ctx.personId` on every call —
 * never trusts `ctx.capabilities`/`ctx.units` (T-042). Throws on a
 * capability that isn't in the catalogue, so a typo cannot look like a
 * working deny (mirrors `getSetting`'s behaviour for an unregistered key).
 */
export async function can(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  params: CanParams,
): Promise<boolean> {
  if (!getCapabilityDefinition(capability)) {
    throw new Error(`Capability is not registered: ${capability}`);
  }

  const today = getTodayInLondon();
  const grants = await findGrantsForCapability(db, ctx.personId, capability, today);
  if (grants.length === 0) {
    return false;
  }

  const needsNationalUnit = grants.some((grant) => grant.scope === PermissionScope.NationalContent);
  const nationalUnitId = needsNationalUnit
    ? ((await findNationalUnitId(db)) ?? undefined)
    : undefined;

  return grants.some((grant) => resolveScope(grant, params.unitId, nationalUnitId));
}
