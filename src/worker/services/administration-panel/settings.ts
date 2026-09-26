import { z } from 'zod';
import {
  BRANDING_FILE_SLOTS,
  LOGO_POSITIONS,
} from '../../../shared/administration-panel/branding-files';
import { readsOnWhite } from '../../../shared/administration-panel/contrast';
import { LANGUAGES } from '../../../shared/core/languages';
import { registerSetting } from '../../core/settings';
import { registerFileSettings } from './file-settings';

/**
 * Service 15's settings (brief 8.1: no default in code; planned in T-019).
 * The language new officers start with (brief 8.5) is required: adding a
 * new person waits until it is set. The Arabic digits choice (brief 8.5)
 * is not: until it is set, Arabic screens show Western digits (D-048).
 */
export function registerAdministrationPanelSettings(): void {
  registerSetting({
    key: 'administration-panel.new_officer_language',
    label: 'Language new officers start with',
    description: 'The language a newly added officer sees until they choose their own (8.5).',
    schema: z.enum(LANGUAGES),
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'administration-panel.arabic_digits',
    label: 'Digits on Arabic screens',
    description: 'Western digits (0-9) or Arabic-Indic digits on Arabic screens (8.5, D-048).',
    schema: z.enum(['western', 'arabic-indic']),
    required: false,
    unitOverrideAllowed: false,
  });
  registerBrandingSettings();
  registerFileSettings();
}

// D-082: a colour is #RRGGBB and must read on white at normal contrast.
const brandColour = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/)
  .refine(readsOnWhite, { message: 'does not reach normal reading contrast against white' });

/**
 * Brief 25 C3: the organisation's name in English and Arabic (D-022: the
 * Arabic may follow, English shows until then), and the main and accent
 * colours (D-082), for the PDFs and the portal's own screens. Required:
 * no letterhead can be produced without them. Set on the Branding screen.
 */
function registerBrandingSettings(): void {
  registerBrandingFileSettings();
  // D-089: the letterhead's one choice.
  registerSetting({
    key: 'administration-panel.logo_position',
    label: 'Logo position',
    description:
      'Where the logo sits on the letterhead: left, centre or right, mirrored in Arabic (25 C3).',
    schema: z.enum(LOGO_POSITIONS),
    required: true,
    unitOverrideAllowed: false,
    input: { kind: 'branding' },
  });
  registerSetting({
    key: 'administration-panel.organisation_name',
    label: 'Organisation name',
    description: 'The organisation name in English and Arabic (25 C3).',
    schema: z.object({ en: z.string().trim().min(1), ar: z.string().trim().min(1).nullable() }),
    required: true,
    unitOverrideAllowed: false,
    input: { kind: 'branding' },
  });
  for (const [key, label] of [
    ['administration-panel.main_colour', 'Main colour'],
    ['administration-panel.accent_colour', 'Accent colour'],
  ] as const) {
    registerSetting({
      key,
      label,
      description:
        'For headings, rules and accents on the PDFs and screens; text stays black on white (D-082).',
      schema: brandColour,
      required: true,
      unitOverrideAllowed: false,
      input: { kind: 'branding' },
    });
  }
}

/** Brief 25 C3: each branding file, held as its file's id (D-080, D-084). */
function registerBrandingFileSettings(): void {
  for (const [slot, { settingKey }] of Object.entries(BRANDING_FILE_SLOTS)) {
    registerSetting({
      key: settingKey,
      label: `Branding file: ${slot}`,
      description: `The ${slot} file, uploaded on the Branding screen (25 C3).`,
      schema: z.string().min(1),
      required: true,
      unitOverrideAllowed: false,
      input: { kind: 'branding' },
    });
  }
}
