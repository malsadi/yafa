import { removeOrphanFiles } from '../core/files';
import { registerCronJob } from './job-registry';

export const ORPHAN_CLEAN_UP_JOB = 'orphan-clean-up';

/** Brief 9.3 and 11: nightly, remove objects in the files bucket with no file record. */
export function registerOrphanCleanUpJob(): void {
  registerCronJob(ORPHAN_CLEAN_UP_JOB, async (env) => {
    await removeOrphanFiles(env.DB, env.FILES);
  });
}
