import { getCronJobHandler } from './job-registry';
import { recordJobRun } from './job-runs-repo';

/**
 * Resolves `jobName` to its registered handler, runs it, and records the
 * outcome unconditionally (brief section 11: "every job" records its last
 * run and outcome) — a job file never has to remember to record its own
 * result. Re-throws after recording, so Cloudflare's own Cron Triggers
 * observability also sees the failure; nothing here swallows an error.
 *
 * Mapping a raw cron expression (`ScheduledController.cron`) to `jobName`
 * is `src/worker/index.ts`'s job, once it exists (T-010's `vars.CRON_JOBS`)
 * — this function takes the resolved name directly, so the dispatcher and
 * registry can be built and tested now without it.
 */
export async function dispatchScheduledJob(jobName: string, env: Env): Promise<void> {
  const handler = getCronJobHandler(jobName);
  if (!handler) {
    throw new Error(`Cron job is not registered: ${jobName}`);
  }

  try {
    await handler(env);
    await recordJobRun(env.DB, { jobName, outcome: 'success' });
  } catch (error) {
    await recordJobRun(env.DB, {
      jobName,
      outcome: 'failure',
      errorCode: error instanceof Error ? error.name : 'unknown',
    });
    throw error;
  }
}
