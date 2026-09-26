/**
 * Brief 9.3: what a file is uploaded for. Each use has its own allowed file
 * types and size limit, set by the data administrator. The first five are
 * the brief's; `branding-images` (the logo and the square icon, D-084) and
 * `fonts` (D-080) are the Branding screen's (25 C3).
 */
export const FILE_USES = [
  'receipt-photos',
  'documents',
  'letter-scans',
  'media-images',
  'video',
  'branding-images',
  'fonts',
] as const;

export type FileUse = (typeof FILE_USES)[number];

/** Brief 9.3: photos taken on a phone are made JPEG and resized on the device first. */
export const PHOTO_USES: readonly FileUse[] = ['receipt-photos', 'media-images'];

/** The file types the portal can store and serve; each use allows those the administrator picks. */
export const FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4',
  'font/woff2',
  'font/ttf',
  'font/otf',
] as const;

export type FileType = (typeof FILE_TYPES)[number];

/** A use's settings keys: its allowed types, and its size limit in megabytes. */
export function fileUseSettingKeys(use: FileUse) {
  const name = use.replaceAll('-', '_');
  return {
    types: `administration-panel.file_types_${name}`,
    sizeLimitMb: `administration-panel.file_size_limit_${name}_mb`,
  };
}
