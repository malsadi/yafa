import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/event-organiser/units/:unitId';
const cap = (capability: string) => ({ kind: 'capability', capability }) as const;
const READ = cap('event-organiser.events.read');
const CREATE = cap('event-organiser.events.create');
const MANAGE = cap('event-organiser.events.manage');
const TEMPLATES = cap('event-organiser.templates.manage');

/** Brief 7.4: the Event organiser's signed-in routes, in the order the app registers them. */
export const EVENT_ORGANISER_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/templates`, access: TEMPLATES },
  { method: 'POST', path: `${UNIT}/templates`, access: TEMPLATES },
  { method: 'PUT', path: `${UNIT}/templates/:templateId`, access: TEMPLATES },
  { method: 'POST', path: `${UNIT}/templates/:templateId/retire`, access: TEMPLATES },
  { method: 'POST', path: `${UNIT}/templates/:templateId/restore`, access: TEMPLATES },
  { method: 'GET', path: `${UNIT}/template-choices`, access: CREATE },
  { method: 'GET', path: `${UNIT}/event-choices`, access: READ },
  { method: 'GET', path: `${UNIT}/event-clashes`, access: READ },
  { method: 'GET', path: `${UNIT}/events`, access: READ },
  { method: 'GET', path: `${UNIT}/events/:eventId`, access: READ },
  { method: 'POST', path: `${UNIT}/events`, access: CREATE },
  { method: 'PUT', path: `${UNIT}/events/:eventId`, access: MANAGE },
  {
    method: 'POST',
    path: `${UNIT}/events/:eventId/approve`,
    access: cap('event-organiser.events.approve'),
  },
  // D-174: the lead officer moves their event with no capability; checked in the service.
  { method: 'POST', path: `${UNIT}/events/:eventId/status`, access: { kind: 'signed-in-only' } },
  { method: 'POST', path: `${UNIT}/events/:eventId/cancel`, access: { kind: 'signed-in-only' } },
  { method: 'GET', path: `${UNIT}/events/:eventId/tasks`, access: READ },
  { method: 'POST', path: `${UNIT}/events/:eventId/tasks`, access: MANAGE },
  { method: 'PUT', path: `${UNIT}/events/:eventId/tasks/:taskId`, access: MANAGE },
  { method: 'GET', path: `${UNIT}/events/:eventId/tasks/:taskId/history`, access: READ },
  { method: 'POST', path: `${UNIT}/events/:eventId/publish`, access: MANAGE },
];
