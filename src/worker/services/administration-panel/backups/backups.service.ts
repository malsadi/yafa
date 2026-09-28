import { getSetting } from '../../../core/settings';
import { dumpDatabase } from './database-dump';

const PREFIX = 'backups/';
const DAY_MS = 24 * 60 * 60 * 1000;

export interface BackupRecord {
  key: string;
  size: number;
  takenAt: string;
}

/** Brief 11 and 25 D3: the database dumped to the backup bucket, named by when it was taken. */
export async function takeBackup(
  db: D1Database,
  bucket: R2Bucket,
  now = new Date(),
): Promise<BackupRecord> {
  const key = `${PREFIX}${now.toISOString().replaceAll(':', '-')}.sql`;
  const object = await bucket.put(key, await dumpDatabase(db), {
    httpMetadata: { contentType: 'application/sql' },
  });
  return { key, size: object.size, takenAt: now.toISOString() };
}

/**
 * Brief 11: backups older than the administrator's retention are removed.
 * Until it is set, nothing is removed, since it can't know what is old enough.
 */
export async function removeOldBackups(
  db: D1Database,
  bucket: R2Bucket,
  now = new Date(),
): Promise<number> {
  const retention = await getSetting<number>(db, 'administration-panel.backup_retention_days');
  if (retention.status === 'not-configured') return 0;
  const cutoff = now.getTime() - retention.value * DAY_MS;
  const old = (await listBackups(bucket)).filter((b) => new Date(b.takenAt).getTime() < cutoff);
  if (old.length > 0) await bucket.delete(old.map((b) => b.key));
  return old.length;
}

/** Brief 25 D3: every backup kept, the latest first. */
export async function listBackups(bucket: R2Bucket): Promise<BackupRecord[]> {
  const backups: BackupRecord[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix: PREFIX, cursor });
    backups.push(
      ...page.objects.map((o) => ({ key: o.key, size: o.size, takenAt: o.uploaded.toISOString() })),
    );
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return backups.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}
