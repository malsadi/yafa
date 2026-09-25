import { NATIONAL_SCOPE } from '../../../shared/core/national-scope';
import {
  SERVICES_THAT_CANNOT_BE_SWITCHED_OFF,
  type ServiceSlug,
} from '../../../shared/core/services';
import { ConflictError } from '../errors';
import { checkResultingState } from './service-switch-checks';
import { listUnitIds, readAllServiceSwitchValues } from './service-switches-repo';
import { withChange } from '../../../shared/core/switch-state';
import { clearServiceSwitchValue, writeServiceSwitchValue } from './write-service-switch-value';

export interface SetServiceSwitchParams {
  service: ServiceSlug;
  /** On, off, or null to clear a unit's own value so it follows the portal-wide one. */
  enabled: boolean | null;
  /** Omit for the portal-wide value. */
  unitId?: string;
  actorPersonId: string;
}

/**
 * Switches a service on or off, portal-wide or for a unit, or returns a
 * unit to the portal-wide value (brief 8.4, 25 C2). Refuses the three
 * services that can never be switched off, and any change whose result
 * breaks a dependency or turns a service on before it is set up
 * (checkResultingState). Never deletes a service's data.
 */
export async function setServiceSwitch(
  db: D1Database,
  params: SetServiceSwitchParams,
): Promise<void> {
  if (SERVICES_THAT_CANNOT_BE_SWITCHED_OFF.includes(params.service)) {
    throw new ConflictError('service-switches.always-on');
  }
  const scope = params.unitId ?? NATIONAL_SCOPE;
  if (params.enabled === null && !params.unitId) {
    throw new ConflictError('service-switches.portal-wide-cannot-be-cleared');
  }
  const before = await readAllServiceSwitchValues(db);
  const after = withChange(before, { service: params.service, scope, enabled: params.enabled });
  const places = params.unitId ? [params.unitId] : [null, ...(await listUnitIds(db))];
  await checkResultingState(db, { service: params.service, places, before, after });
  const write = { service: params.service, scope, actorPersonId: params.actorPersonId };
  if (params.enabled === null) await clearServiceSwitchValue(db, write);
  else await writeServiceSwitchValue(db, { ...write, enabled: params.enabled });
}
