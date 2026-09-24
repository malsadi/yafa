import { createClerkAccounts } from '../clerk';
import { lockAccountsWhoseLastTermEnded } from '../services/committee-register';
import { registerCronJob } from './job-registry';

export const LOCK_ACCOUNTS_JOB = 'lock-accounts-after-last-term';

// Recorded in the audit log as the actor of each lock this job makes.
const ACTOR = `scheduled-job:${LOCK_ACCOUNTS_JOB}`;

/** D-063 (O-025): daily, lock accounts whose last term has ended (brief 6.2). */
export function registerLockAccountsJob(): void {
  registerCronJob(LOCK_ACCOUNTS_JOB, async (env) => {
    await lockAccountsWhoseLastTermEnded(env.DB, createClerkAccounts(env.CLERK_SECRET_KEY), ACTOR);
  });
}
