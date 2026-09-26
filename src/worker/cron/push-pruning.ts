import { prunePush } from '../services/communication-hub';
import { registerCronJob } from './job-registry';

export const PUSH_PRUNING_JOB = 'push-pruning';

/** Brief 11: removes expired push subscriptions, and undelivered alerts past their period (D-050). */
export function registerPushPruningJob(): void {
  registerCronJob(PUSH_PRUNING_JOB, async (env) => {
    await prunePush(env.DB, new Date());
  });
}
