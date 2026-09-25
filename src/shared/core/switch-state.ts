import { NATIONAL_SCOPE } from './national-scope';
import { SERVICES, SERVICES_THAT_CANNOT_BE_SWITCHED_OFF, type ServiceSlug } from './services';

/** Every stored switch value: a service at a scope (a unit id, or the portal-wide scope). */
export interface SwitchRow {
  service: string;
  scope: string;
  enabled: boolean;
}

/**
 * Whether a service is on in one place: the unit's own value, then the
 * portal-wide value, then off (brief 8.4, D-020); the three that can never
 * be switched off are always on. `unitId` null asks about the portal-wide
 * value itself. The same rule as `isServiceEnabled`, over rows in memory.
 */
export function isOnIn(rows: readonly SwitchRow[], service: ServiceSlug, unitId: string | null) {
  if (SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(service)) return true;
  const at = (scope: string) =>
    rows.find((r) => r.service === service && r.scope === scope)?.enabled;
  return (unitId === null ? undefined : at(unitId)) ?? at(NATIONAL_SCOPE) ?? false;
}

/** The rows as they would be after one change: a value set, or a unit's own value cleared (null). */
export function withChange(
  rows: readonly SwitchRow[],
  change: { service: ServiceSlug; scope: string; enabled: boolean | null },
): SwitchRow[] {
  const others = rows.filter((r) => !(r.service === change.service && r.scope === change.scope));
  return change.enabled === null
    ? others
    : [...others, { service: change.service, scope: change.scope, enabled: change.enabled }];
}

/** Every service, on or off, in one place. */
export function servicesOn(rows: readonly SwitchRow[], unitId: string | null): Set<ServiceSlug> {
  return new Set(SERVICES.map((s) => s.slug).filter((slug) => isOnIn(rows, slug, unitId)));
}
