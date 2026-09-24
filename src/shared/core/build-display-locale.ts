import type { Language } from './languages';

/** The administrator's Arabic digits choice (brief section 8.5). */
export type ArabicDigits = 'western' | 'arabic-indic';

const NUMBERING_SYSTEMS: Record<ArabicDigits, string> = {
  western: 'latn',
  'arabic-indic': 'arab',
};

/**
 * The `Intl` locale for dates and numbers in one language (brief sections
 * 8.5 and 28): UK English, or Arabic with the digits the administrator has
 * chosen. D-048: until they choose, Arabic screens show Western digits 0-9 —
 * never left to the browser's default.
 */
export function buildDisplayLocale(language: Language, arabicDigits: ArabicDigits | null): string {
  if (language === 'en') {
    return 'en-GB';
  }
  return `ar-u-nu-${NUMBERING_SYSTEMS[arabicDigits ?? 'western']}`;
}
