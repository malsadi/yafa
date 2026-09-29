/**
 * Brief 9.3: what a file is uploaded for. Each use has its own allowed file
 * types and size limit, set by the data administrator. The branding files
 * are fixed files in the project, never uploaded (D-223).
 */
export const FILE_USES = [
  'receipt-photos',
  'documents',
  'letter-scans',
  'media-images',
  'video',
] as const;

export type FileUse = (typeof FILE_USES)[number];

/** Brief 9.3: photos taken on a phone are made JPEG and resized on the device first. */
export const PHOTO_USES: readonly FileUse[] = ['receipt-photos', 'media-images'];

/**
 * D-218: the only file types the portal ever stores and serves. Passive
 * formats only — never HTML, never SVG. A setting can allow no type outside
 * this list, and an upload of one is refused, whatever the settings say.
 * MP4 is only for video (see USE_TYPE_CEILING).
 */
export const FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4',
] as const;

export type FileType = (typeof FILE_TYPES)[number];

/** D-218: the owner's passive types: PDF, JPEG, PNG, DOCX and XLSX. */
export const PASSIVE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const satisfies readonly FileType[];

/**
 * D-218: the most each use may ever allow. The administrator picks within
 * it. Video (brief 9.3) keeps MP4, for its own use only.
 */
export const USE_TYPE_CEILING: Record<FileUse, readonly FileType[]> = {
  'receipt-photos': PASSIVE_TYPES,
  documents: PASSIVE_TYPES,
  'letter-scans': PASSIVE_TYPES,
  'media-images': PASSIVE_TYPES,
  video: ['video/mp4'],
};

/** A use's settings keys: its allowed types, and its size limit in megabytes. */
export function fileUseSettingKeys(use: FileUse) {
  const name = use.replaceAll('-', '_');
  return {
    types: `administration-panel.file_types_${name}`,
    sizeLimitMb: `administration-panel.file_size_limit_${name}_mb`,
  };
}
