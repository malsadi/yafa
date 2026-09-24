import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import {
  SERVICES,
  SERVICES_THAT_CANNOT_BE_SWITCHED_OFF,
  type ServiceSlug,
} from '../../../shared/core/services';
import { readServiceSwitchValuesForScopes } from './service-switches-repo';

/**
 * Every service that is on for one unit, in brief section 3.1's order —
 * the same resolution as `isServiceEnabled` (unit override, then the
 * portal-wide value, then off, D-020; the three that cannot be switched
 * off are always on), read in one query for the navigation (T-067).
 */
export async function listEnabledServices(db: D1Database, unitId: string): Promise<ServiceSlug[]> {
  const rows = await readServiceSwitchValuesForScopes(db, [unitId, NATIONAL_SCOPE]);
  const valueFor = (service: string, scope: string): boolean | undefined =>
    rows.find((row) => row.service === service && row.scope === scope)?.enabled;

  return SERVICES.map((service) => service.slug).filter(
    (slug) =>
      SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(slug) ||
      (valueFor(slug, unitId) ?? valueFor(slug, NATIONAL_SCOPE) ?? false),
  );
}
