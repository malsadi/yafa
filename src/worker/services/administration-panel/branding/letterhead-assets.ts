import {
  BRANDING_FILE_SLOTS,
  type BrandingFileSlot,
} from '../../../../shared/administration-panel/branding-files';
import type { PdfFont } from '../../../core/pdf';
import { findFile } from '../../../core/files';
import { getSetting } from '../../../core/settings';

const FONT_FORMATS: Record<string, PdfFont['format']> = {
  'font/woff2': 'woff2',
  'font/ttf': 'truetype',
  'font/otf': 'opentype',
};

async function slotObject(db: D1Database, bucket: R2Bucket, slot: BrandingFileSlot) {
  const fileId = await getSetting<string>(db, BRANDING_FILE_SLOTS[slot].settingKey);
  const file = fileId.status === 'configured' ? await findFile(db, fileId.value) : null;
  const object = file ? await bucket.get(file.key) : null;
  return file && object
    ? { contentType: file.contentType, data: await object.arrayBuffer() }
    : null;
}

function base64(data: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(data)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** The logo as a `data:` URL, since a render reaches nothing outside the page (core/pdf). */
export async function logoDataUrl(db: D1Database, bucket: R2Bucket): Promise<string | null> {
  const logo = await slotObject(db, bucket, 'logo');
  return logo ? `data:${logo.contentType};base64,${base64(logo.data)}` : null;
}

/** D-080: the uploaded Latin and Arabic fonts, embedded in the PDF under the names the design uses. */
export async function letterheadFonts(db: D1Database, bucket: R2Bucket): Promise<PdfFont[]> {
  const fonts = await Promise.all([
    slotObject(db, bucket, 'latin-font').then((f) => (f ? { ...f, family: 'Portal Latin' } : null)),
    slotObject(db, bucket, 'arabic-font').then((f) =>
      f ? { ...f, family: 'Portal Arabic' } : null,
    ),
  ]);
  return fonts.flatMap((font) => {
    const format = font ? FONT_FORMATS[font.contentType] : undefined;
    return font && format ? [{ family: font.family, data: font.data, format }] : [];
  });
}
