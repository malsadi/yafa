import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import {
  SERVICES_THAT_CANNOT_BE_SWITCHED_OFF,
  type ServiceSlug,
} from '../../../shared/core/services';
import {
  assertDependenciesEnabled,
  assertNothingElseDependsOnIt,
  assertRequiredSettingsConfigured,
} from './service-switch-checks';
import { writeServiceSwitchValue } from './write-service-switch-value';

export interface SetServiceSwitchParams {
  service: ServiceSlug;
  enabled: boolean;
  /** Omit for the portal-wide value. */
  unitId?: string;
  actorPersonId: string;
}

/**
 * Switches a service on or off, portal-wide or for a unit (brief section
 * 8.4). Refuses: the three services that can never be switched off; a
 * switch-on with a required setting unset (15 C6); a switch-on while a
 * service it depends on is off; a switch-off while another enabled service
 * still depends on it.
 */
export async function setServiceSwitch(
  db: D1Database,
  params: SetServiceSwitchParams,
): Promise<void> {
  if (SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(params.service)) {
    throw new Error(`${params.service} can never be switched off`);
  }

  if (params.enabled) {
    await assertRequiredSettingsConfigured(db, params.service, params.unitId);
    await assertDependenciesEnabled(db, params.service, params.unitId);
  } else {
    await assertNothingElseDependsOnIt(db, params.service, params.unitId);
  }

  await writeServiceSwitchValue(db, {
    service: params.service,
    scope: params.unitId ?? NATIONAL_SCOPE,
    enabled: params.enabled,
    actorPersonId: params.actorPersonId,
  });
}
