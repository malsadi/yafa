import type { Hono } from 'hono';
import { dispatchScheduledJob } from '../cron/dispatch-scheduled-job';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerAuditLogRoutes,
  registerDataImportRoutes,
  registerBackupsRoutes,
  registerFileHousekeepingRoutes,
  registerMaintenanceModeRoutes,
  registerSystemHealthRoutes,
} from '../services/administration-panel';

/** Brief 25 Stage D: the Administration panel's operations screens (D1 to D6). */
export function registerOperationsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  env: Env,
  keys: ClerkVerificationKeys,
): void {
  const db = env.DB;
  const schedules: Readonly<Record<string, string | undefined>> = env.CRON_JOBS;
  // A job run again records its own outcome, failure included (brief 11), for the health screen.
  const run = (jobName: string) => dispatchScheduledJob(jobName, env).catch(() => undefined);
  registerSystemHealthRoutes(app, db, keys, { schedules, run });
  registerAuditLogRoutes(app, db, keys);
  registerBackupsRoutes(app, db, keys, env.BACKUPS);
  registerFileHousekeepingRoutes(app, db, keys, env.FILES);
  registerMaintenanceModeRoutes(app, db, keys);
  registerDataImportRoutes(app, db, keys);
}
