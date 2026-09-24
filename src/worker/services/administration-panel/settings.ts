import { z } from 'zod';
import { LANGUAGES } from '../../../shared/core/languages';
import { registerSetting } from '../../core/settings';

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
}
