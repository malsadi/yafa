import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { actionListFiltersSchema, taskChangeSchema, taskDetailsSchema } from './tasks.schema';
import {
  changeTask,
  createTask,
  listActionList,
  listOwnerChoices,
  MANAGE,
  READ,
} from './tasks.service';

const UNIT = '/api/task-tracker/units/:unitId';

/** Brief 18 A and B2: the unit's action list, and creating and changing its tasks. HTTP only. */
export function registerTasksRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/tasks`, access: read });
  registerRoute({ method: 'GET', path: `${UNIT}/owners`, access: manage });
  registerRoute({ method: 'POST', path: `${UNIT}/tasks`, access: manage });
  registerRoute({ method: 'PUT', path: `${UNIT}/tasks/:taskId`, access: manage });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/tasks`, active, async (c) => {
    const filters = actionListFiltersSchema.parse(c.req.query());
    return c.json(
      await listActionList(db, c.get('requestContext'), c.req.param('unitId'), filters),
    );
  });
  app.get(`${UNIT}/owners`, active, async (c) =>
    c.json(await listOwnerChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(`${UNIT}/tasks`, active, async (c) => {
    const details = taskDetailsSchema.parse(await c.req.json());
    return c.json(
      await createTask(db, c.get('requestContext'), c.req.param('unitId'), details),
      201,
    );
  });
  app.put(`${UNIT}/tasks/:taskId`, active, async (c) => {
    const save = taskChangeSchema.parse(await c.req.json());
    await changeTask(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      taskId: c.req.param('taskId'),
      ...save,
    });
    return c.body(null, 204);
  });
}
