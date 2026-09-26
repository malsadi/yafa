import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { completeUpload, startUpload, type FileStorage } from '../../../core/files';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { uploadTarget } from './upload-target';
import { buildUploadedDocumentStatements } from './uploads.repo';
import type { CompleteArchiveUpload } from './uploads.schema';

/** Brief 15 A2 and 9.3: the upload link for a new document's file. */
export async function startArchiveUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; fileName: string; size: number; contentType: string },
): Promise<StartedUpload & { documentId: string }> {
  const documentId = generateId();
  const target = await uploadTarget(db, ctx, params.unitId, documentId);
  const started = await startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    {
      ...target,
      ...params,
    },
  );
  return { ...started, documentId };
}

/**
 * Brief 15 A2, D-096, D-097: record the file, locked, as the document's
 * first version, in one batch with the document and its audit entry.
 */
export async function completeArchiveUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: CompleteArchiveUpload & { unitId: string; documentId: string },
): Promise<{ documentId: string }> {
  const target = await uploadTarget(db, ctx, params.unitId, params.documentId);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: true,
  });
  const row = {
    id: params.documentId,
    unitId: params.unitId,
    categoryId: params.categoryId,
    title: params.title,
    description: params.description ?? null,
    documentDate: params.documentDate,
    fileId: file.id,
    filedBy: ctx.personId,
    filedAt: new Date().toISOString(),
  };
  await db.batch([
    statement,
    ...buildUploadedDocumentStatements(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'archive-document.uploaded',
      entityType: 'archive-document',
      entityId: row.id,
      after: row,
    }),
  ]);
  return { documentId: row.id };
}
