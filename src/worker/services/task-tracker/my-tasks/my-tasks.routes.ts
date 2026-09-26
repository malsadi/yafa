import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { taskHistory } from '../task-history/task-history.service';
import { changeTaskStatus } from '../tasks/task-status.service';
import { taskStatusSchema } from '../tasks/tasks.schema';
import { listMyTasks } from './my-tasks.service';

const TASK = '/api/task-tracker/units/:unitId/tasks/:taskId';
// D-137 (D-004): every officer sees their own tasks and changes their
// status with nothing granted; each service checks owner or manager itself.
const OWN = { kind: 'signed-in-only' } as const;

/** Brief 18 A4, B1 and B4: My tasks; a task's status; its history. HTTP only. */
export function registerMyTasksRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: '/api/task-tracker/my-tasks', access: OWN });
  registerRoute({ method: 'POST', path: `${TASK}/status`, access: OWN });
  registerRoute({ method: 'GET', path: `${TASK}/history`, access: OWN });
  const active = requireActiveAccess(db, keys);
  app.get('/api/task-tracker/my-tasks', active, async (c) =>
    c.json(await listMyTasks(db, c.get('requestContext'))),
  );
  app.post(`${TASK}/status`, active, async (c) => {
    const change = taskStatusSchema.parse(await c.req.json());
    await changeTaskStatus(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      taskId: c.req.param('taskId'),
      ...change,
    });
    return c.body(null, 204);
  });
  app.get(`${TASK}/history`, active, async (c) =>
    c.json(
      await taskHistory(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        taskId: c.req.param('taskId'),
      }),
    ),
  );
}
