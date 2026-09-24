import { getCronJobHandler } from './job-registry';
import { recordJobRun } from './job-runs-repo';

/**
 * Resolves `jobName` to its registered handler, runs it, and records the
 * outcome unconditionally (brief section 11: "every job" records its last
 * run and outcome) — a job file never has to remember to record its own
 * result. Re-throws after recording, so Cloudflare's own Cron Triggers
 * observability also sees the failure; nothing here swallows an error.
 *
 * A job not registered yet does nothing and records a normal run (D-044).
 * Mapping the raw cron expression to `jobName` (T-010's `vars.CRON_JOBS`)
 * is `src/worker/app/handle-scheduled.ts`'s job.
 */
export async function dispatchScheduledJob(jobName: string, env: Env): Promise<void> {
  const handler = getCronJobHandler(jobName);
  if (!handler) {
    // D-044: a schedule whose job has not been built yet (each job arrives
    // with the phase that owns it) does nothing and records a normal run,
    // so the logs are never full of errors that would hide a real one.
    await recordJobRun(env.DB, { jobName, outcome: 'success' });
    return;
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
