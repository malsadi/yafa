import { getSetting } from '../settings';
import { findRecordedKeys } from './files-repo';

const DAY_MS = 24 * 60 * 60 * 1000;
// D1 takes at most 100 bound values per statement.
const KEYS_PER_QUERY = 100;

/**
 * Brief 9.3 and 11: removes objects in the files bucket that have no file
 * record and are older than the administrator's orphan age — the leftovers
 * of uploads never completed. Until the age is set, it removes nothing, since
 * it can't know what is old enough (rule 5). Returns how many it removed.
 */
export async function removeOrphanFiles(db: D1Database, bucket: R2Bucket, now = new Date()) {
  const age = await getSetting<number>(db, 'administration-panel.orphan_file_age_days');
  if (age.status === 'not-configured') return 0;
  const cutoff = now.getTime() - age.value * DAY_MS;
  let removed = 0;
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ cursor });
    const old = page.objects.filter((o) => o.uploaded.getTime() < cutoff).map((o) => o.key);
    for (let i = 0; i < old.length; i += KEYS_PER_QUERY) {
      const keys = old.slice(i, i + KEYS_PER_QUERY);
      const recorded = await findRecordedKeys(db, keys);
      const orphans = keys.filter((key) => !recorded.has(key));
      if (orphans.length > 0) await bucket.delete(orphans);
      removed += orphans.length;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return removed;
}
