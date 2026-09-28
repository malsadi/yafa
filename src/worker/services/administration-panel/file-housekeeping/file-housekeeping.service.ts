import type { FileHousekeeping } from '../../../../shared/administration-panel/file-housekeeping';
import { findRecordedKeys } from '../../../core/files';
import { requireRowsPerPage } from '../../../core/pagination';
import type { RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { requirePortalCapability } from '../operations-access';
import { readStorageByUnit } from '../system-health/system-health.repo';

const KEYS_PER_QUERY = 100;

type Orphan = FileHousekeeping['orphans']['latest'][number];

/** Every object in the files bucket with no file record. */
async function findOrphans(db: D1Database, bucket: R2Bucket): Promise<Orphan[]> {
  const orphans: Orphan[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ cursor });
    for (let i = 0; i < page.objects.length; i += KEYS_PER_QUERY) {
      const batch = page.objects.slice(i, i + KEYS_PER_QUERY);
      const recorded = await findRecordedKeys(
        db,
        batch.map((o) => o.key),
      );
      for (const o of batch)
        if (!recorded.has(o.key))
          orphans.push({ key: o.key, size: o.size, uploadedAt: o.uploaded.toISOString() });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return orphans.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/**
 * Brief 25 D5: storage used per unit, and the objects with no record — an
 * upload never completed, or a file whose saving failed after R2. The
 * nightly clean-up removes them once older than the administrator's age.
 * The latest "Rows per page" of them are listed.
 */
export async function fileHousekeeping(
  db: D1Database,
  ctx: RequestContext,
  bucket: R2Bucket,
): Promise<FileHousekeeping> {
  await requirePortalCapability(db, ctx, 'administration-panel.file-housekeeping.read');
  const rows = await requireRowsPerPage(db);
  const [storage, orphans, age] = await Promise.all([
    readStorageByUnit(db),
    findOrphans(db, bucket),
    getSetting<number>(db, 'administration-panel.orphan_file_age_days'),
  ]);
  return {
    storage,
    orphans: {
      count: orphans.length,
      bytes: orphans.reduce((sum, o) => sum + o.size, 0),
      latest: orphans.slice(0, rows),
    },
    orphanAgeDays: age.status === 'configured' ? age.value : null,
  };
}
