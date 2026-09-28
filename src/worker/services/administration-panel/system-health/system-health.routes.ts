import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { CAPABILITY, runJobAgain, systemHealth, type JobSchedules } from './system-health.service';

const PATH = '/api/administration-panel/system-health';
const ACCESS = { kind: 'capability', capability: CAPABILITY } as const;

/** Brief 25 D1: the health screen, and running a job again. HTTP only. */
export function registerSystemHealthRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  jobs: { schedules: JobSchedules; run: (jobName: string) => Promise<void> },
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/jobs/:jobName/run`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) =>
    c.json(await systemHealth(db, c.get('requestContext'), jobs.schedules)),
  );
  app.post(`${PATH}/jobs/:jobName/run`, active, async (c) => {
    await runJobAgain(db, c.get('requestContext'), { ...jobs, jobName: c.req.param('jobName') });
    return c.body(null, 204);
  });
}
