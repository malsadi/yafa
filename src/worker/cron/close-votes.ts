import { queueVoteResults } from '../services/communication-hub';
import { registerCronJob } from './job-registry';

export const CLOSE_VOTES_JOB = 'close-votes';

/** Brief 11: votes past their closing date have their result alerts queued (20 A2, C1). */
export function registerCloseVotesJob(): void {
  registerCronJob(CLOSE_VOTES_JOB, async (env) => {
    await queueVoteResults(env.DB, env.NOTIFICATIONS_QUEUE, new Date().toISOString());
  });
}
