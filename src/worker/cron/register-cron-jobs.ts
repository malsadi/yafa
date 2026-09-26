import { registerLockAccountsJob } from './lock-accounts-after-last-term';
import { registerOrphanCleanUpJob } from './orphan-clean-up';

/** Every scheduled job built so far (brief 11); each phase adds its own. */
export function registerCronJobs(): void {
  registerLockAccountsJob();
  registerOrphanCleanUpJob();
}
