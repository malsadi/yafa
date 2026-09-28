import type { SystemHealth } from '../../../../shared/administration-panel/system-health';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { requireRowsPerPage } from '../../../core/pagination';
import type { RequestContext } from '../../../core/permissions';
import { requirePortalCapability } from '../operations-access';
import { readJobRuns, readPushFailures, readStorageByUnit } from './system-health.repo';

export const CAPABILITY = 'administration-panel.system-health.manage';

/** The scheduled jobs, by cron expression (brief 11: set in `wrangler.jsonc`). */
export type JobSchedules = Readonly<Record<string, string | undefined>>;

/**
 * Brief 25 D1 and O-168: every job's last run, undelivered phone alerts
 * (the latest "Rows per page" of them), and storage per unit.
 */
export async function systemHealth(
  db: D1Database,
  ctx: RequestContext,
  schedules: JobSchedules,
): Promise<SystemHealth> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  const rows = await requireRowsPerPage(db);
  const [runs, pushFailures, storage] = await Promise.all([
    readJobRuns(db),
    readPushFailures(db, rows),
    readStorageByUnit(db),
  ]);
  const jobs = Object.entries(schedules).flatMap(([schedule, jobName]) => {
    if (!jobName) return [];
    const run = runs.get(jobName);
    return [
      {
        jobName,
        schedule,
        lastRunAt: run?.lastRunAt ?? null,
        outcome: run?.outcome ?? null,
        errorCode: run?.errorCode ?? null,
      },
    ];
  });
  return { jobs, pushFailures, storage };
}

/** Brief 25 D1: a scheduled job run again now; its outcome is recorded like any run. */
export async function runJobAgain(
  db: D1Database,
  ctx: RequestContext,
  params: { jobName: string; schedules: JobSchedules; run: (jobName: string) => Promise<void> },
): Promise<void> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  if (!Object.values(params.schedules).includes(params.jobName))
    throw new NotFoundError('system-health.job-not-found');
  await buildAuditStatement(db, {
    actorPersonId: ctx.personId,
    action: 'system-health.job-run',
    entityType: 'job',
    entityId: params.jobName,
  }).run();
  await params.run(params.jobName);
}
