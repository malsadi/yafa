import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import {
  SERVICES_THAT_CANNOT_BE_SWITCHED_OFF,
  type ServiceSlug,
} from '../../../shared/core/services';
import { readServiceSwitchValue } from './service-switches-repo';

/**
 * Resolves whether a service is on: unit override, then the portal-wide
 * value, then off by default (brief section 8.4, D-020) — except the three
 * services that can never be switched off, which are always on.
 */
export async function isServiceEnabled(
  db: D1Database,
  service: ServiceSlug,
  unitId?: string,
): Promise<boolean> {
  if (SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(service)) {
    return true;
  }

  if (unitId) {
    const unitValue = await readServiceSwitchValue(db, service, unitId);
    if (unitValue !== null) {
      return unitValue;
    }
  }

  const nationalValue = await readServiceSwitchValue(db, service, NATIONAL_SCOPE);
  return nationalValue ?? false;
}
