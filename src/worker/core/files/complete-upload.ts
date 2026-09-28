import type { FileRecord } from '../../../shared/core/file-record';
import type { FileType } from '../../../shared/core/file-uses';
import { ConflictError, NotFoundError } from '../errors';
import { matchesFileSignature, SIGNATURE_BYTES } from './file-signature';
import { requireAllowedFile } from './file-use-rules';
import { buildInsertFileStatement } from './files-repo';
import { objectKeyFor, type UploadTarget } from './upload-target';

export interface CompletedUpload {
  fileId: string;
  fileName: string;
  uploadedBy: string;
  /** A file of a locked record is locked from the start (brief 9.3). */
  locked: boolean;
  multipart?: { uploadId: string; parts: { partNumber: number; etag: string }[] };
}

function checksumOf(object: R2Object): string {
  const md5 = object.checksums.md5;
  return md5
    ? [...new Uint8Array(md5)].map((b) => b.toString(16).padStart(2, '0')).join('')
    : object.etag;
}

/** D-218: the stored bytes must start as the declared type does. */
async function requireMatchingContent(bucket: R2Bucket, key: string, contentType: FileType) {
  const start = await bucket.get(key, { range: { offset: 0, length: SIGNATURE_BYTES } });
  const bytes = new Uint8Array(start ? await start.arrayBuffer() : new ArrayBuffer(0));
  if (!matchesFileSignature(contentType, bytes)) throw new ConflictError('files.type-not-allowed');
}

/**
 * Brief 9.3, step two: the object must be in R2, with the size and type its
 * use allows, and its content must be of that type (D-218); only then is it recorded — R2 first, then the D1 record. An
 * object that doesn't fit is removed, never recorded. Returns the record,
 * and the statement for the caller to add to its own batch (build rule 6).
 */
export async function completeUpload(
  bucket: R2Bucket,
  db: D1Database,
  params: UploadTarget & CompletedUpload,
): Promise<{ file: FileRecord; statement: D1PreparedStatement }> {
  const key = objectKeyFor(params, params.fileId, params.fileName);
  if (params.multipart) {
    await bucket
      .resumeMultipartUpload(key, params.multipart.uploadId)
      .complete(params.multipart.parts);
  }
  const object = await bucket.head(key);
  if (!object) throw new NotFoundError('files.not-uploaded');
  const contentType = object.httpMetadata?.contentType ?? '';
  try {
    await requireAllowedFile(db, { use: params.use, contentType, size: object.size });
    await requireMatchingContent(bucket, key, contentType as FileType);
  } catch (refusal) {
    await bucket.delete(key);
    throw refusal;
  }
  const file: FileRecord = {
    id: params.fileId,
    key,
    unitId: params.unitId,
    service: params.service,
    recordId: params.recordId,
    use: params.use,
    fileName: params.fileName,
    uploadedBy: params.uploadedBy,
    size: object.size,
    contentType,
    checksum: checksumOf(object),
    locked: params.locked,
    createdAt: new Date().toISOString(),
  };
  return { file, statement: buildInsertFileStatement(db, file) };
}
