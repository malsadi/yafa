import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/meeting-recorder/units/:unitId';
const ONE = `${UNIT}/meetings/:meetingId`;
const READ = { kind: 'capability', capability: 'meeting-recorder.meetings.read' } as const;
const MANAGE = { kind: 'capability', capability: 'meeting-recorder.meetings.manage' } as const;
// D-200: the chair and secretary act with no capability; checked in the service.
const CHAIR = { kind: 'signed-in-only' } as const;

/** Brief 7.4: the Meeting recorder's signed-in routes, in the order the app registers them. */
export const MEETING_RECORDER_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/meeting-choices`, access: READ },
  { method: 'GET', path: `${UNIT}/meetings`, access: READ },
  { method: 'GET', path: ONE, access: READ },
  { method: 'POST', path: `${UNIT}/meetings`, access: MANAGE },
  { method: 'PUT', path: ONE, access: MANAGE },
  { method: 'POST', path: `${ONE}/hold`, access: CHAIR },
  { method: 'POST', path: `${ONE}/cancel`, access: MANAGE },
  { method: 'POST', path: `${ONE}/attendees`, access: MANAGE },
  { method: 'POST', path: `${ONE}/attendees/:personId/remove`, access: MANAGE },
  { method: 'PUT', path: `${ONE}/attendees/:personId/attendance`, access: CHAIR },
  { method: 'POST', path: `${ONE}/agenda`, access: CHAIR },
  { method: 'PUT', path: `${ONE}/agenda/:itemId`, access: CHAIR },
  { method: 'POST', path: `${ONE}/agenda/:itemId/remove`, access: MANAGE },
  { method: 'PUT', path: `${ONE}/agenda-order`, access: MANAGE },
  { method: 'PUT', path: `${ONE}/agenda/:itemId/comments/:personId`, access: CHAIR },
  { method: 'PUT', path: `${ONE}/agenda/:itemId/outcome`, access: CHAIR },
  { method: 'POST', path: `${ONE}/log-report`, access: CHAIR },
  { method: 'GET', path: `${ONE}/report/file`, access: READ },
  { method: 'POST', path: `${ONE}/send-later`, access: MANAGE },
];
