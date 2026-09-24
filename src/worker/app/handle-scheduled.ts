import { dispatchScheduledJob } from '../cron';

/**
 * Maps the firing cron expression to its job name through `vars.CRON_JOBS`
 * (T-010 — the schedules themselves are D-001's, in `wrangler.jsonc`), then
 * hands it to the dispatcher, which records the outcome (brief section 11).
 * An expression with no mapped name is a deploy wiring error and throws.
 */
export async function handleScheduled(controller: ScheduledController, env: Env): Promise<void> {
  const jobs: Record<string, string | undefined> = env.CRON_JOBS;
  const jobName = jobs[controller.cron];
  if (!jobName) {
    throw new Error(`No job is mapped to cron expression: ${controller.cron}`);
  }
  await dispatchScheduledJob(jobName, env);
}
