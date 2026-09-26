import {
  BRANDING_FILE_SLOTS,
  type BrandingFileSlot,
} from '../../../../shared/administration-panel/branding-files';
import { findFile } from '../../../core/files';
import { getSetting } from '../../../core/settings';
import { readBranding } from './branding.service';

/**
 * D-088: one branding file, by its slot only — never by an id or path from
 * the request — so nothing but these files can be reached publicly. Null
 * until the administrator has uploaded it.
 */
export async function readBrandingFile(
  db: D1Database,
  bucket: R2Bucket,
  slot: BrandingFileSlot,
): Promise<Response | null> {
  const fileId = await getSetting<string>(db, BRANDING_FILE_SLOTS[slot].settingKey);
  if (fileId.status === 'not-configured') return null;
  const file = await findFile(db, fileId.value);
  const object = file ? await bucket.get(file.key) : null;
  if (!file || !object) return null;
  return new Response(object.body, {
    headers: { 'Content-Type': file.contentType, 'Content-Length': String(file.size) },
  });
}

/**
 * D-036 and D-088: the install file, built from branding — the organisation's
 * name, its main colour, and the two square icons (D-084). Null until the
 * name is set (rule 5); the browser then has no install file to offer.
 */
export async function buildInstallFile(db: D1Database): Promise<object | null> {
  const branding = await readBranding(db);
  if (!branding.organisationName) return null;
  const icon = (size: number) => ({
    src: `/branding/icon-${String(size)}.png`,
    sizes: `${String(size)}x${String(size)}`,
    type: 'image/png',
  });
  return {
    name: branding.organisationName.en,
    short_name: branding.organisationName.en,
    lang: 'en',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    ...(branding.mainColour ? { theme_color: branding.mainColour } : {}),
    icons: [icon(192), icon(512)],
  };
}
