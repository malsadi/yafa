import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/task-tracker/units/:unitId';
const READ = { kind: 'capability', capability: 'task-tracker.tasks.read' } as const;
const MANAGE = { kind: 'capability', capability: 'task-tracker.tasks.manage' } as const;
// D-137 (D-004): an officer's own tasks need nothing granted.
const OWN = { kind: 'signed-in-only' } as const;

/** Brief 7.4: the Task tracker's routes, in the order the app registers them. */
export const TASK_TRACKER_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/tasks`, access: READ },
  { method: 'GET', path: `${UNIT}/owners`, access: MANAGE },
  { method: 'POST', path: `${UNIT}/tasks`, access: MANAGE },
  { method: 'PUT', path: `${UNIT}/tasks/:taskId`, access: MANAGE },
  { method: 'GET', path: '/api/task-tracker/my-tasks', access: OWN },
  { method: 'POST', path: `${UNIT}/tasks/:taskId/status`, access: OWN },
  { method: 'GET', path: `${UNIT}/tasks/:taskId/history`, access: OWN },
];
