import type { StartedUpload } from '../../../../shared/core/file-record';
import {
  EVENT_FILE_USES,
  type EventFileRecord,
} from '../../../../shared/event-organiser/event-file-uses';
import type { EventFileSection } from '../../../../shared/event-organiser/event-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import {
  completeUpload,
  findFile,
  serveFile,
  startUpload,
  type FileStorage,
  type UploadTarget,
} from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { requireEventCapability, requireEventUnit, runEventBatch } from '../event-access';
import { requireNotClosed, requireUnitEvent } from '../events/event-guards';
import { READ } from '../events/events.service';
import { requireLeadOrManager } from '../lead-or-manager';
import {
  buildInsertEventFileStatement,
  buildRemoveEventFileStatements,
  findEventFile,
  listEventFiles,
} from './event-files.repo';
import type { CompleteFile, StartFile } from './event-files.schema';

interface EventRef {
  unitId: string;
  eventId: string;
}

/** Brief 21 F1, F2 and 9.3: where an event's file goes — its unit, the event, and a use its section takes. */
async function uploadTarget(
  db: D1Database,
  params: EventRef & { section: EventFileSection; use: UploadTarget['use'] },
): Promise<UploadTarget> {
  if (!EVENT_FILE_USES[params.section].includes(params.use))
    throw new ConflictError('event-organiser.use-not-in-section');
  const unit = await requireEventUnit(db, params.unitId);
  return {
    unitId: unit.id,
    unitCode: unit.code,
    service: 'event-organiser',
    recordId: params.eventId,
    use: params.use,
  };
}

/** D-185: an upload link, for the lead officer or those who manage events, until the event closes. */
export async function startEventFileUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: EventRef & StartFile,
): Promise<StartedUpload> {
  requireNotClosed(await requireLeadOrManager(db, ctx, params));
  const target = await uploadTarget(db, params);
  return startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    { ...target, ...params },
  );
}

/** Brief 9.3: the uploaded file checked in R2, then recorded with its section in one batch. */
export async function addEventFile(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: EventRef & CompleteFile,
): Promise<void> {
  requireNotClosed(await requireLeadOrManager(db, ctx, params));
  const target = await uploadTarget(db, params);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: false,
  });
  const at = new Date().toISOString();
  await runEventBatch(db, [
    statement,
    buildInsertEventFileStatement(db, { ...params, fileId: file.id, actor: ctx.personId, at }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.file-added',
      entityType: 'event',
      entityId: params.eventId,
      after: { fileId: file.id, section: params.section, fileName: file.fileName },
    }),
  ]);
}

/** Brief 21 F1, F2 and D-185: everyone who sees the event sees its files. */
export async function eventFiles(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef,
): Promise<EventFileRecord[]> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  await requireUnitEvent(db, params.unitId, params.eventId);
  return listEventFiles(db, params.eventId);
}

export async function downloadEventFile(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: EventRef & { fileId: string },
): Promise<Response> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  await requireUnitEvent(db, params.unitId, params.eventId);
  const file = (await findEventFile(db, params)) ? await findFile(db, params.fileId) : null;
  if (!file) throw new NotFoundError('event-organiser.file-not-found');
  return serveFile(db, storage, file);
}

/**
 * D-185: before close, a file is removed — its records in one batch, with
 * an audit entry, then its object; an object left behind is cleared by the
 * nightly orphan clean-up (9.3). After close, nothing can be removed.
 */
export async function removeEventFile(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: EventRef & { fileId: string },
): Promise<void> {
  requireNotClosed(await requireLeadOrManager(db, ctx, params));
  const found = await findEventFile(db, params);
  if (!found) throw new NotFoundError('event-organiser.file-not-found');
  await runEventBatch(db, [
    ...buildRemoveEventFileStatements(db, params.fileId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.file-removed',
      entityType: 'event',
      entityId: params.eventId,
      before: { fileId: params.fileId },
    }),
  ]);
  await storage.bucket.delete(found.key);
}
