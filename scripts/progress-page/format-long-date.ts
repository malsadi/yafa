import type { PageLanguage } from './bilingual.ts';

// Brief section 28: UK English dates; Arabic from Intl, with Western digits
// until the administrator chooses otherwise (D-048).
const LOCALES: Record<PageLanguage, string> = { en: 'en-GB', ar: 'ar-u-nu-latn' };

/** "2026-09-24" → "24 September 2026" / "24 سبتمبر 2026". */
export function formatLongDate(isoDate: string, language: PageLanguage): string {
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
