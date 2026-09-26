import { ConflictError } from '../errors';
import { getSetting, listSettingDefinitions } from '../settings';
import type { ServiceSlug } from '../../../shared/core/services';
import { REQUIRED_ADMIN_TEXTS } from '../../../shared/administration-panel/required-texts';
import { SERVICE_DEPENDENCIES } from './service-dependencies';
import { servicesOn, type SwitchRow } from '../../../shared/core/switch-state';

/** Brief 8.4 and 15 C6: every required setting of the service is set there, and every text it needs written (D-086). */
async function requireSetUp(db: D1Database, service: ServiceSlug, unitId: string | null) {
  const required = listSettingDefinitions().filter(
    (definition) => definition.required && definition.key.startsWith(`${service}.`),
  );
  for (const { key } of required) {
    if ((await getSetting(db, key, unitId ?? undefined)).status === 'not-configured') {
      throw new ConflictError('service-switches.setup-incomplete');
    }
  }
  // D-086: the administrator's texts the service needs, written.
  for (const key of REQUIRED_ADMIN_TEXTS[service] ?? []) {
    const written = await db.prepare('SELECT 1 FROM admin_texts WHERE key = ?').bind(key).first();
    if (!written) throw new ConflictError('service-switches.setup-incomplete');
  }
}

/**
 * Brief 8.4 and 25 C2: refuses a change whose result, in any place it
 * reaches, leaves a service on while a service it needs is off, or turns a
 * service on before its required settings are set there. A portal-wide
 * change reaches every unit without its own value, so each place is judged
 * on the state the change would leave, not just the scope changed.
 */
export async function checkResultingState(
  db: D1Database,
  params: {
    service: ServiceSlug;
    places: (string | null)[];
    before: SwitchRow[];
    after: SwitchRow[];
  },
): Promise<void> {
  for (const place of params.places) {
    const on = servicesOn(params.after, place);
    for (const [service, needs] of Object.entries(SERVICE_DEPENDENCIES)) {
      if (!on.has(service as ServiceSlug)) continue;
      if (needs.some((needed) => !on.has(needed))) {
        throw new ConflictError(
          service === params.service
            ? 'service-switches.needs-service'
            : 'service-switches.needed-by-service',
        );
      }
    }
    if (on.has(params.service) && !servicesOn(params.before, place).has(params.service)) {
      await requireSetUp(db, params.service, place);
    }
  }
}
