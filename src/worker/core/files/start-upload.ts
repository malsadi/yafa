import type { StartedUpload } from '../../../shared/core/file-record';
import { generateId } from '../ids';
import { requireAllowedFile } from './file-use-rules';
import { presignUrl } from './presign-url';
import type { R2Access } from './r2-access';
import { objectKeyFor, type UploadTarget } from './upload-target';

// Technical limits, not configuration: the brief asks for "short-lived"
// upload links, and multipart parts must be at least 5 MB in R2's S3 API.
export const UPLOAD_LINK_SECONDS = 15 * 60;
export const PART_BYTES = 10 * 1024 * 1024;

/**
 * Brief 9.3, step one: after the caller's permission check, and once the
 * file's type and size fit its use, a short-lived link the browser uploads
 * to directly — one link, or one per part for a large file.
 */
export async function startUpload(
  db: D1Database,
  storage: { bucket: R2Bucket; access: R2Access },
  params: UploadTarget & { fileName: string; size: number; contentType: string },
): Promise<StartedUpload> {
  await requireAllowedFile(db, params);
  const fileId = generateId();
  const key = objectKeyFor(params, fileId, params.fileName);
  if (params.size <= PART_BYTES) {
    const url = await presignUrl(storage.access, {
      method: 'PUT',
      key,
      expiresSeconds: UPLOAD_LINK_SECONDS,
    });
    return { fileId, kind: 'single', url };
  }
  const upload = await storage.bucket.createMultipartUpload(key, {
    httpMetadata: { contentType: params.contentType },
  });
  const parts = Math.ceil(params.size / PART_BYTES);
  const partUrls = await Promise.all(
    Array.from({ length: parts }, (_, index) =>
      presignUrl(storage.access, {
        method: 'PUT',
        key,
        expiresSeconds: UPLOAD_LINK_SECONDS,
        query: { partNumber: String(index + 1), uploadId: upload.uploadId },
      }),
    ),
  );
  return { fileId, kind: 'multipart', uploadId: upload.uploadId, partSize: PART_BYTES, partUrls };
}
