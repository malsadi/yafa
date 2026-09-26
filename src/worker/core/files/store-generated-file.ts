import type { FileRecord } from '../../../shared/core/file-record';
import { generateId } from '../ids';
import { buildInsertFileStatement } from './files-repo';
import { objectKeyFor, type UploadTarget } from './upload-target';

/**
 * Brief 9.3 and 9.4: a file the portal makes itself, such as a PDF to be
 * filed — written to R2 first, then returned with the statement recording
 * it, for the caller's own batch. A filed PDF is a locked file (9.4).
 */
export async function storeGeneratedFile(
  bucket: R2Bucket,
  db: D1Database,
  params: UploadTarget & {
    fileName: string;
    contentType: string;
    body: Uint8Array;
    createdBy: string;
    locked: boolean;
  },
): Promise<{ file: FileRecord; statement: D1PreparedStatement }> {
  const id = generateId();
  const key = objectKeyFor(params, id, params.fileName);
  const object = await bucket.put(key, params.body, {
    httpMetadata: { contentType: params.contentType },
  });
  const md5 = object.checksums.md5;
  const file: FileRecord = {
    id,
    key,
    unitId: params.unitId,
    service: params.service,
    recordId: params.recordId,
    use: params.use,
    fileName: params.fileName,
    uploadedBy: params.createdBy,
    size: params.body.byteLength,
    contentType: params.contentType,
    checksum: md5
      ? [...new Uint8Array(md5)].map((b) => b.toString(16).padStart(2, '0')).join('')
      : object.etag,
    locked: params.locked,
    createdAt: new Date().toISOString(),
  };
  return { file, statement: buildInsertFileStatement(db, file) };
}
