import { removeOldBackups, takeBackup } from '../services/administration-panel';
import { registerCronJob } from './job-registry';

export const BACKUP_JOB = 'backup';

/** Brief 11: nightly, the database to the backup bucket; backups older than the retention removed. */
export function registerBackupJob(): void {
  registerCronJob(BACKUP_JOB, async (env) => {
    await takeBackup(env.DB, env.BACKUPS);
    await removeOldBackups(env.DB, env.BACKUPS);
  });
}
