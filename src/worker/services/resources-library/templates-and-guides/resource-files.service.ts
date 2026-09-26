import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import {
  completeUpload,
  findFile,
  serveFile,
  startUpload,
  type FileStorage,
} from '../../../core/files';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireLibraryCapability, requireWritable } from '../library-access';
import { libraryUploadTarget } from '../library-upload-target';
import { runLibraryBatch } from '../library-versioning';
import { libraryView } from '../library-view';
import {
  buildInsertResourceStatement,
  buildUpdateResourceStatement,
  findResource,
} from './templates-and-guides.repo';
import type { CompleteReplacement, CompleteResource } from './templates-and-guides.schema';
import { MANAGE, requireManagedResource } from './templates-and-guides.service';

interface FileParams {
  fileName: string;
  size: number;
  contentType: string;
}

/** Brief 16 A1, A2 and 9.3: the upload link for a new template's or guide's file. */
export async function startNewResource(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: FileParams & { unitId: string },
): Promise<StartedUpload & { resourceId: string }> {
  const unit = await requireLibraryCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const resourceId = generateId();
  const target = libraryUploadTarget(unit, resourceId);
  const started = await startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    { ...target, ...params },
  );
  return { ...started, resourceId };
}

/** Brief 16 A1, A2 and D-103: record the file and its details as a new template or guide. */
export async function completeNewResource(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: CompleteResource & { unitId: string; resourceId: string },
): Promise<void> {
  const unit = await requireLibraryCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...libraryUploadTarget(unit, params.resourceId),
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: false,
  });
  const row = {
    id: params.resourceId,
    unitId: unit.id,
    kind: params.kind,
    title: params.title,
    description: params.description,
    language: params.language,
    fileId: file.id,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await runLibraryBatch(db, [
    statement,
    buildInsertResourceStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'resource.added',
      entityType: 'resource',
      entityId: row.id,
      after: row,
    }),
  ]);
}

/** D-104 and 9.3: the upload link for a template's or guide's replacement file. */
export async function startReplacement(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: FileParams & { unitId: string; resourceId: string },
): Promise<StartedUpload> {
  const { unit } = await requireManagedResource(db, ctx, params);
  const target = libraryUploadTarget(unit, params.resourceId);
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

/** D-104: the new file replaces the old, which is kept, no longer shown (9.1: from the version read). */
export async function completeReplacement(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: CompleteReplacement & { unitId: string; resourceId: string },
): Promise<void> {
  const { resource, unit } = await requireManagedResource(db, ctx, params);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...libraryUploadTarget(unit, resource.id),
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: false,
  });
  await runLibraryBatch(db, [
    statement,
    buildUpdateResourceStatement(db, {
      id: resource.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      fileId: file.id,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'resource.file-replaced',
      entityType: 'resource',
      entityId: resource.id,
      before: { fileId: resource.fileId },
      after: { fileId: file.id },
    }),
  ]);
}

/** Brief 16 A3 and 9.3: download a template or guide the officer's unit sees. */
export async function downloadResource(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: { unitId: string; resourceId: string },
): Promise<Response> {
  const view = await libraryView(db, ctx, params.unitId, MANAGE);
  const resource = await findResource(db, params.resourceId);
  const file = resource && view.shows(resource) ? await findFile(db, resource.fileId) : null;
  if (!file) throw new NotFoundError('resources-library.resource-not-found');
  return serveFile(db, storage, file);
}
