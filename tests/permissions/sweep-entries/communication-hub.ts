import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/communication-hub/units/:unitId';
const READ = { kind: 'capability', capability: 'communication-hub.noticeboard.read' } as const;
const MANAGE = { kind: 'capability', capability: 'communication-hub.noticeboard.manage' } as const;
const SEND = { kind: 'capability', capability: 'communication-hub.circulars.send' } as const;
const START = { kind: 'capability', capability: 'communication-hub.discussions.start' } as const;
const REQUESTS = { kind: 'capability', capability: 'communication-hub.requests.send' } as const;
// D-157 to D-161: officers, members and authors, checked in the service.
const OFFICER = { kind: 'signed-in-only' } as const;

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
  { method: 'POST', path: `${UNIT}/circulars`, access: SEND },
  { method: 'GET', path: `${UNIT}/circular-branches`, access: SEND },
  { method: 'GET', path: `${UNIT}/circulars`, access: OFFICER },
  { method: 'GET', path: `${UNIT}/circulars/:circularId`, access: OFFICER },
  { method: 'GET', path: `${UNIT}/sent-circulars`, access: OFFICER },
  { method: 'GET', path: '/api/communication-hub/role-networks', access: OFFICER },
  { method: 'GET', path: '/api/communication-hub/role-networks/:roleId/messages', access: OFFICER },
  {
    method: 'POST',
    path: '/api/communication-hub/role-networks/:roleId/messages',
    access: OFFICER,
  },
  { method: 'POST', path: `${UNIT}/discussions`, access: START },
  { method: 'GET', path: `${UNIT}/discussion-invitees`, access: START },
  { method: 'GET', path: '/api/communication-hub/discussions', access: OFFICER },
  {
    method: 'GET',
    path: '/api/communication-hub/discussions/:discussionId/messages',
    access: OFFICER,
  },
  {
    method: 'POST',
    path: '/api/communication-hub/discussions/:discussionId/messages',
    access: OFFICER,
  },
  {
    method: 'POST',
    path: '/api/communication-hub/discussions/:discussionId/members',
    access: OFFICER,
  },
  {
    method: 'POST',
    path: '/api/communication-hub/discussions/:discussionId/members/:personId/remove',
    access: OFFICER,
  },
  {
    method: 'POST',
    path: '/api/communication-hub/discussions/:discussionId/leave',
    access: OFFICER,
  },
  { method: 'POST', path: `${UNIT}/requests`, access: REQUESTS },
  { method: 'GET', path: `${UNIT}/request-units`, access: REQUESTS },
  { method: 'POST', path: `${UNIT}/requests/:requestId/close`, access: REQUESTS },
  { method: 'GET', path: `${UNIT}/requests`, access: OFFICER },
  { method: 'GET', path: `${UNIT}/requests/:requestId/replies`, access: OFFICER },
  { method: 'POST', path: `${UNIT}/requests/:requestId/replies`, access: OFFICER },
  { method: 'POST', path: '/api/communication-hub/messages/:messageId/remove', access: OFFICER },
];
