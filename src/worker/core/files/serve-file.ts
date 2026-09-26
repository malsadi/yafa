import type { FileRecord } from '../../../shared/core/file-record';
import { NotFoundError } from '../errors';
import { BYTES_PER_MB, requireNumberSetting } from './file-use-rules';
import { presignUrl } from './presign-url';
import type { R2Access } from './r2-access';

/**
 * Brief 9.3, downloads: after the caller's permission check, a small file is
 * streamed; one above the administrator's size is sent as a short-lived link
 * (a redirect), lasting as long as the administrator sets.
 */
export async function serveFile(
  db: D1Database,
  storage: { bucket: R2Bucket; access: () => R2Access },
  file: FileRecord,
): Promise<Response> {
  const thresholdMb = await requireNumberSetting(
    db,
    'administration-panel.download_link_threshold_mb',
  );
  if (file.size > thresholdMb * BYTES_PER_MB) {
    const minutes = await requireNumberSetting(
      db,
      'administration-panel.download_link_lifetime_minutes',
    );
    const url = await presignUrl(storage.access(), {
      method: 'GET',
      key: file.key,
      expiresSeconds: minutes * 60,
    });
    return Response.redirect(url, 302);
  }
  const object = await storage.bucket.get(file.key);
  if (!object) throw new NotFoundError('files.not-found');
  return new Response(object.body, {
    headers: { 'Content-Type': file.contentType, 'Content-Length': String(file.size) },
  });
}
