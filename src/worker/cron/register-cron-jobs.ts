import { registerBackupJob } from './backup';
import { registerCloseVotesJob } from './close-votes';
import { hasCronJobs } from './job-registry';
import { registerLockAccountsJob } from './lock-accounts-after-last-term';
import { registerOrphanCleanUpJob } from './orphan-clean-up';
import { registerPushPruningJob } from './push-pruning';
import { registerTaskRemindersJob } from './task-reminders';

/**
 * Every scheduled job built so far (brief 11); each phase adds its own.
 * T-150: Vite's dev server can run the Worker's entry file again in the
 * same process, so a second call does nothing.
 */
export function registerCronJobs(): void {
  if (hasCronJobs()) return;
  registerLockAccountsJob();
  registerOrphanCleanUpJob();
  registerTaskRemindersJob();
  registerCloseVotesJob();
  registerPushPruningJob();
  registerBackupJob();
}
