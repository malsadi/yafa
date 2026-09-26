import { z } from 'zod';
import { FILE_TYPES, FILE_USES, fileUseSettingKeys } from '../../../shared/core/file-uses';
import { registerSetting } from '../../core/settings';

const wholePositive = z.number().int().positive();

/**
 * Brief 9.3 and 25's settings: for each use, the allowed file types and a
 * size limit (in megabytes); the size above which a download is a
 * short-lived link, and how long it lasts (minutes); the maximum image
 * dimension (pixels); and how old an object with no record must be before
 * the nightly clean-up removes it (days). No defaults: uploads for a use
 * wait until its rules are set (rule 5).
 */
export function registerFileSettings(): void {
  registerFileUseSettings();
  registerFileHandlingSettings();
}

function registerFileUseSettings(): void {
  for (const use of FILE_USES) {
    const keys = fileUseSettingKeys(use);
    registerSetting({
      key: keys.types,
      label: `Allowed file types: ${use}`,
      description: `The file types that may be uploaded as ${use} (9.3).`,
      schema: z.array(z.enum(FILE_TYPES)).min(1),
      required: true,
      unitOverrideAllowed: false,
    });
    registerSetting({
      key: keys.sizeLimitMb,
      label: `Size limit (MB): ${use}`,
      description: `The largest file that may be uploaded as ${use}, in megabytes (9.3).`,
      schema: wholePositive,
      required: true,
      unitOverrideAllowed: false,
    });
  }
}

function registerFileHandlingSettings(): void {
  for (const [key, label, description] of [
    [
      'administration-panel.download_link_threshold_mb',
      'Download link size (MB)',
      'Files larger than this, in megabytes, are downloaded through a short-lived link (9.3).',
    ],
    [
      'administration-panel.download_link_lifetime_minutes',
      'Download link lifetime (minutes)',
      'How long a download link works, in minutes (9.3).',
    ],
    [
      'administration-panel.max_image_dimension_px',
      'Maximum image dimension (pixels)',
      'Photos are resized on the device to fit this before upload (9.3).',
    ],
    [
      'administration-panel.orphan_file_age_days',
      'Orphan file age (days)',
      'An uploaded object with no file record is removed once this old, in days (9.3, 11).',
    ],
  ] as const) {
    registerSetting({
      key,
      label,
      description,
      schema: wholePositive,
      required: true,
      unitOverrideAllowed: false,
    });
  }
}
