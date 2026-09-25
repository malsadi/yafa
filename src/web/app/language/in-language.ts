import type { Language } from '../../../shared/core/languages';

/**
 * A text the administrator writes in both languages (brief 8.5), in the
 * officer's language. D-022: while the Arabic isn't written, the English
 * shows — the screen that edits it says the Arabic is missing.
 */
export function inLanguage(text: { textEn: string; textAr: string | null }, language: Language) {
  return language === 'ar' ? (text.textAr ?? text.textEn) : text.textEn;
}
