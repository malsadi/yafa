import { LANGUAGES, type Language } from '../../../shared/core/languages';

/**
 * Brief section 8.5: before sign-in, "the browser's language decides". The
 * first of the browser's preferred languages that the portal has wins; a
 * browser preferring neither gets the first language in `LANGUAGES`
 * (T-068, raised with the owner as O-018).
 */
export function detectBrowserLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split('-')[0];
    const match = LANGUAGES.find((language) => language === primary);
    if (match) {
      return match;
    }
  }
  return LANGUAGES[0];
}
