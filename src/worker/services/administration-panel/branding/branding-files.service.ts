import {
  BRANDING_FILE_SLOTS,
  ICON_SIZES,
  type BrandingFileSlot,
} from '../../../../shared/administration-panel/branding-files';
import type { StartedUpload } from '../../../../shared/core/file-record';
import { ConflictError, ForbiddenError } from '../../../core/errors';
import { completeUpload, startUpload, type UploadTarget } from '../../../core/files';
import { can, type RequestContext } from '../../../core/permissions';
import { buildSetSettingStatements } from '../../../core/settings';
import { listUnits } from '../../committee-register';
import type { BrandingStorage } from './branding-storage';
import { requireSquarePng } from './icon-check';

const CAPABILITY = 'administration-panel.branding.manage';

async function requireBrandingCapability(db: D1Database, ctx: RequestContext) {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** Branding belongs to the General Council, the national unit (brief 7.1). */
async function brandingTarget(db: D1Database, slot: BrandingFileSlot): Promise<UploadTarget> {
  const national = (await listUnits(db)).find((unit) => unit.type === 'national');
  if (!national) throw new ConflictError('branding.no-national-unit');
  return {
    unitId: national.id,
    unitCode: national.code,
    service: 'administration-panel',
    recordId: 'branding',
    use: BRANDING_FILE_SLOTS[slot].use,
  };
}

/** Brief 25 C3 and 9.3: the upload link for one branding file. */
export async function startBrandingUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: BrandingStorage,
  params: { slot: BrandingFileSlot; fileName: string; size: number; contentType: string },
): Promise<StartedUpload> {
  await requireBrandingCapability(db, ctx);
  const target = await brandingTarget(db, params.slot);
  return startUpload(
    db,
    { bucket: storage.bucket, access: storage.access() },
    { ...target, ...params },
  );
}

/**
 * Brief 25 C3 and 9.3: record the uploaded file, and make it the slot's
 * file, in one batch (build rule 6). An icon must be square and exact (D-084).
 */
export async function completeBrandingUpload(
  db: D1Database,
  ctx: RequestContext,
  storage: BrandingStorage,
  params: {
    slot: BrandingFileSlot;
    fileId: string;
    fileName: string;
    multipart?: { uploadId: string; parts: { partNumber: number; etag: string }[] };
  },
): Promise<{ fileId: string }> {
  await requireBrandingCapability(db, ctx);
  const target = await brandingTarget(db, params.slot);
  const { file, statement } = await completeUpload(storage.bucket, db, {
    ...target,
    ...params,
    uploadedBy: ctx.personId,
    locked: false,
  });
  const iconSize = ICON_SIZES[params.slot];
  if (iconSize) await requireSquarePng(storage.bucket, file.key, iconSize);
  const settingKey = BRANDING_FILE_SLOTS[params.slot].settingKey;
  await db.batch([
    statement,
    ...buildSetSettingStatements(db, {
      key: settingKey,
      value: file.id,
      actorPersonId: ctx.personId,
    }),
  ]);
  return { fileId: file.id };
}
