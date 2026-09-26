import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/calendar/units/:unitId';
const READ = { kind: 'capability', capability: 'calendar.calendar.read' } as const;
const MANAGE = { kind: 'capability', capability: 'calendar.community-dates.manage' } as const;

/** Brief 7.4: the Calendar's signed-in routes, in the order the app registers them. */
export const CALENDAR_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/items`, access: READ },
  { method: 'GET', path: `${UNIT}/clashes`, access: READ },
  { method: 'POST', path: `${UNIT}/community-dates`, access: MANAGE },
  { method: 'PUT', path: `${UNIT}/community-dates/:dateId`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/community-dates/:dateId/retire`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/community-dates/:dateId/restore`, access: MANAGE },
];
