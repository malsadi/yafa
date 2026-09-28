import type { StartedUpload } from '../../../../shared/core/file-record';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import {
  completeUpload,
  findFile,
  serveFile,
  startUpload,
  type FileStorage,
  type UploadTarget,
} from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import {
  READ,
  RECORD,
  requireAchievementCapability,
  requireWritable,
  runAchievementBatch,
  visibleUnitIds,
} from '../achievement-access';
import { requireOpenAchievement } from '../achievements/achievement-guards';
import type { CompletePhoto, StartPhoto } from './photos.schema';

interface Ref {
  unitId: string;
  achievementId: string;
}

/** Brief 24 A1 and 9.3: where an achievement's photo goes — its unit, the achievement, "media images". */
async function photoTarget(db: D1Database, ctx: RequestContext, ref: Ref): Promise<UploadTarget> {
  const unit = await requireAchievementCapability(db, ctx, RECORD, ref.unitId);
  requireWritable(unit);
  await requireOpenAchievement(db, unit.id, ref.achievementId);
  return {
    unitId: unit.id,
    unitCode: unit.code,
    service: 'achievements-and-reports',
    recordId: ref.achievementId,
    use: 'media-images',
  };
}

/** The upload link for a photo, while the achievement can still change (O-152). */
export async function startPhotoUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: Ref & StartPhoto,
): Promise<StartedUpload> {
  const target = await photoTarget(db, ctx, params);
  return startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    { ...target, ...params },
  );
}

/** Brief 9.3: the uploaded photo checked in R2, then recorded with the achievement in one batch. */
export async function addPhoto(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: Ref & CompletePhoto,
): Promise<void> {
  const target = await photoTarget(db, ctx, params);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    fileId: params.fileId,
    fileName: params.fileName,
    multipart: params.multipart,
    uploadedBy: ctx.personId,
    locked: false,
  });
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    statement,
    db
      .prepare(
        'INSERT INTO achievement_photos (achievement_id, file_id, retired_at, added_by, added_at) VALUES (?, ?, NULL, ?, ?)',
      )
      .bind(params.achievementId, file.id, ctx.personId, at),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'achievement.photo-added',
      entityType: 'achievement',
      entityId: params.achievementId,
      after: { fileId: file.id },
    }),
  ]);
}

/** D-213 choice: a photo taken off the achievement is retired, kept in storage — until its report is finalised. */
export async function removePhoto(
  db: D1Database,
  ctx: RequestContext,
  params: Ref & { fileId: string },
): Promise<void> {
  await photoTarget(db, ctx, params);
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    db
      .prepare(
        'UPDATE achievement_photos SET retired_at = ? WHERE achievement_id = ? AND file_id = ? AND retired_at IS NULL',
      )
      .bind(at, params.achievementId, params.fileId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'achievement.photo-removed',
      entityType: 'achievement',
      entityId: params.achievementId,
      after: { fileId: params.fileId },
    }),
  ]);
}

/** A photo of an achievement the reader sees (D-215: their unit's, the General Council's, or every unit's). */
export async function downloadPhoto(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: Ref & { fileId: string },
): Promise<Response> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  const visible = await visibleUnitIds(db, unit);
  const row = await db
    .prepare(
      `SELECT a.unit_id AS unitId FROM achievement_photos p JOIN achievements a ON a.id = p.achievement_id
       WHERE p.achievement_id = ? AND p.file_id = ? AND p.retired_at IS NULL AND a.withdrawn_at IS NULL`,
    )
    .bind(params.achievementId, params.fileId)
    .first<{ unitId: string }>();
  const file = row && visible.includes(row.unitId) ? await findFile(db, params.fileId) : null;
  if (!file) throw new NotFoundError('achievements-and-reports.photo-not-found');
  return serveFile(db, storage, file);
}
