import { getSetting, listSettingDefinitions } from '../settings';
import { SERVICES, type ServiceSlug } from '../../../shared/core/services';
import { SERVICE_DEPENDENCIES } from './service-dependencies';
import { isServiceEnabled } from './is-service-enabled';

/** Brief section 8.4/15 C6: a service cannot switch on with a required setting unset. */
export async function assertRequiredSettingsConfigured(
  db: D1Database,
  service: ServiceSlug,
  unitId?: string,
): Promise<void> {
  const servicePrefix = `${service}.`;
  const requiredKeys = listSettingDefinitions()
    .filter((definition) => definition.required && definition.key.startsWith(servicePrefix))
    .map((definition) => definition.key);

  for (const key of requiredKeys) {
    const resolution = await getSetting(db, key, unitId);
    if (resolution.status === 'not-configured') {
      throw new Error(`Cannot switch on ${service}: setting "${key}" is not configured`);
    }
  }
}

/** Brief section 8.4: cannot switch on while something it needs is off. */
export async function assertDependenciesEnabled(
  db: D1Database,
  service: ServiceSlug,
  unitId?: string,
): Promise<void> {
  const dependencies = SERVICE_DEPENDENCIES[service] ?? [];
  for (const dependency of dependencies) {
    if (!(await isServiceEnabled(db, dependency, unitId))) {
      throw new Error(`Cannot switch on ${service}: it needs ${dependency}, which is off`);
    }
  }
}

/** Brief section 8.4: cannot switch off while something enabled still needs it. */
export async function assertNothingElseDependsOnIt(
  db: D1Database,
  service: ServiceSlug,
  unitId?: string,
): Promise<void> {
  const dependents = SERVICES.filter((candidate) =>
    SERVICE_DEPENDENCIES[candidate.slug]?.includes(service),
  );
  for (const dependent of dependents) {
    if (await isServiceEnabled(db, dependent.slug, unitId)) {
      throw new Error(`Cannot switch off ${service}: ${dependent.slug} needs it and is on`);
    }
  }
}
