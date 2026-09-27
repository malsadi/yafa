import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { taskChangeSchema, taskDetailsSchema } from '../../task-tracker';
import { MANAGE, READ } from '../events/events.service';
import { addEventTask, changeEventTask, eventTasks, eventTaskSteps } from './event-tasks.service';

const TASKS = '/api/event-organiser/units/:unitId/events/:eventId/tasks';
const ONE = `${TASKS}/:taskId`;

/** Brief 21 B1 to B3: the event's tasks, its progress, and each task's history. HTTP only. */
export function registerEventTasksRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'GET', path: TASKS, access: read });
  registerRoute({ method: 'POST', path: TASKS, access: manage });
  registerRoute({ method: 'PUT', path: ONE, access: manage });
  registerRoute({ method: 'GET', path: `${ONE}/history`, access: read });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    eventId: c.req.param('eventId'),
  });
  app.get(TASKS, active, async (c) =>
    c.json(await eventTasks(db, c.get('requestContext'), ref(c))),
  );
  app.post(TASKS, active, async (c) => {
    const task = taskDetailsSchema.parse(await c.req.json());
    return c.json(await addEventTask(db, c.get('requestContext'), { ...ref(c), task }), 201);
  });
  app.put(ONE, active, async (c) => {
    const change = taskChangeSchema.parse(await c.req.json());
    await changeEventTask(db, c.get('requestContext'), {
      ...ref(c),
      taskId: c.req.param('taskId'),
      ...change,
    });
    return c.body(null, 204);
  });
  app.get(`${ONE}/history`, active, async (c) =>
    c.json(
      await eventTaskSteps(db, c.get('requestContext'), {
        ...ref(c),
        taskId: c.req.param('taskId'),
      }),
    ),
  );
}
