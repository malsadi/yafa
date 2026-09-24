import { registerLockAccountsJob } from './lock-accounts-after-last-term';

/** Every scheduled job built so far (brief 11); each phase adds its own. */
export function registerCronJobs(): void {
  registerLockAccountsJob();
}
