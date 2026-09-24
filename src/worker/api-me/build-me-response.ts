import type { MeResponse } from '../../shared/core/me-response';
import { isMaintenanceModeOn } from '../core/maintenance-mode';
import { listEnabledServices } from '../core/service-switches';
import type { SessionState } from '../middleware';
import { findPersonLanguage, findUnitsByIds } from './me-repo';

/**
 * What the web app needs to choose a screen (T-067): the session state, the
 * officer's saved language once a person is linked, and — only when active
 * — their own units with the services switched on for each (navigation,
 * unit switcher) and whether maintenance mode is on (the banner, brief
 * section 12). `context.capabilities` is a UI hint only (T-042).
 */
export async function buildMeResponse(
  db: D1Database,
  sessionState: SessionState,
): Promise<MeResponse> {
  if (sessionState.status === 'not-active') {
    return { status: sessionState.status };
  }
  const personId =
    sessionState.status === 'active' ? sessionState.context.personId : sessionState.personId;
  const language = await findPersonLanguage(db, personId);
  if (sessionState.status === 'notice-not-set') {
    return { status: sessionState.status, language };
  }
  if (sessionState.status === 'notice-not-acknowledged') {
    return { status: sessionState.status, language, noticeVersionId: sessionState.noticeVersionId };
  }

  const { context } = sessionState;
  const unitRows = await findUnitsByIds(db, context.units);
  const unitsWithServices = await Promise.all(
    unitRows.map(async (unit) => ({
      ...unit,
      enabledServices: await listEnabledServices(db, unit.id),
    })),
  );
  return {
    status: sessionState.status,
    language,
    context,
    units: unitsWithServices,
    maintenanceMode: await isMaintenanceModeOn(db),
  };
}
