import type { FileUse } from '../core/file-uses';

/**
 * Brief 25 C3 and D-080, D-084: the files the Branding screen takes — the
 * logo, the square icon at the two sizes phones need, and the Latin and
 * Arabic font files. Each is one required setting holding its file's id.
 */
export const BRANDING_FILE_SLOTS = {
  logo: { use: 'branding-images', settingKey: 'administration-panel.logo_file' },
  'icon-192': { use: 'branding-images', settingKey: 'administration-panel.small_icon_file' },
  'icon-512': { use: 'branding-images', settingKey: 'administration-panel.large_icon_file' },
  'latin-font': { use: 'fonts', settingKey: 'administration-panel.latin_font_file' },
  'arabic-font': { use: 'fonts', settingKey: 'administration-panel.arabic_font_file' },
} as const satisfies Record<string, { use: FileUse; settingKey: string }>;

export type BrandingFileSlot = keyof typeof BRANDING_FILE_SLOTS;

export const BRANDING_FILE_SLOT_NAMES = Object.keys(BRANDING_FILE_SLOTS) as BrandingFileSlot[];

/** D-084: an icon slot's exact square size in pixels, which phones require. */
export const ICON_SIZES: Partial<Record<BrandingFileSlot, number>> = {
  'icon-192': 192,
  'icon-512': 512,
};

/** D-089: where the logo sits — left, centre or right, mirrored in Arabic. */
export const LOGO_POSITIONS = ['left', 'centre', 'right'] as const;

export type LogoPosition = (typeof LOGO_POSITIONS)[number];
