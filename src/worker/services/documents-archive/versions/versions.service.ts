import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { completeUpload, startUpload, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { uploadTarget } from '../uploads/upload-target';
import { buildNextVersionStatement, findDocumentSource } from './versions.repo';
import type { CompleteVersionUpload } from './versions.schema';

/**
 * An uploaded document of this unit, which the officer may upload to. An
 * automatic filing is locked and has no versions (A4); another unit's is
 * not found.
 */
async function versionTarget(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; documentId: string },
) {
  const target = await uploadTarget(db, ctx, params.unitId, params.documentId);
  const document = await findDocumentSource(db, params.documentId);
  if (document?.unitId !== params.unitId) throw new NotFoundError('documents-archive.not-found');
  if (document.source === 'automatic') {
    throw new ConflictError('documents-archive.automatic-filing-locked');
  }
  return target;
}

/** Brief 15 A4 and 9.3: the upload link for a document's new version. */
export async function startVersionUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: {
    unitId: string;
    documentId: string;
    fileName: string;
    size: number;
    contentType: string;
  },
): Promise<StartedUpload> {
  const target = await versionTarget(db, ctx, params);
  return startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    {
      ...target,
      fileName: params.fileName,
      size: params.size,
      contentType: params.contentType,
    },
  );
}

/**
 * Brief 15 A4 and D-110: record the file, locked, as the document's next
 * version with its own document date. Earlier versions and their files are
 * kept (15 build notes).
 */
export async function completeVersionUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: CompleteVersionUpload & { unitId: string; documentId: string },
): Promise<void> {
  const target = await versionTarget(db, ctx, params);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: true,
  });
  const row = {
    documentId: params.documentId,
    fileId: file.id,
    documentDate: params.documentDate,
    addedBy: ctx.personId,
    at: new Date().toISOString(),
  };
  await db.batch([
    statement,
    buildNextVersionStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'archive-document.version-added',
      entityType: 'archive-document',
      entityId: params.documentId,
      after: row,
    }),
  ]);
}
