import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/communication-hub/units/:unitId';
const READ = { kind: 'capability', capability: 'communication-hub.noticeboard.read' } as const;
const MANAGE = { kind: 'capability', capability: 'communication-hub.noticeboard.manage' } as const;

/** Brief 7.4: the Communication hub's signed-in routes, in the order the app registers them. */
export const COMMUNICATION_HUB_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/notices`, access: READ },
  { method: 'POST', path: `${UNIT}/notices`, access: MANAGE },
  { method: 'PUT', path: `${UNIT}/notices/:noticeId`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/notices/:noticeId/retire`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/notices/:noticeId/restore`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/notices/:noticeId/ballot`, access: READ },
  { method: 'GET', path: `${UNIT}/voter-choices`, access: MANAGE },
  { method: 'PUT', path: `${UNIT}/notices/:noticeId/closing-date`, access: MANAGE },
];
