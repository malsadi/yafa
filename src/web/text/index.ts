import type { Language } from '../../shared/core/languages';
import { arabicText } from './ar';
import { englishText } from './en';

export type TextBundle = typeof englishText;

const bundles: Record<Language, TextBundle> = { en: englishText, ar: arabicText };

/** Every user-facing text for one language (brief section 8.5). */
export function getTextBundle(language: Language): TextBundle {
  return bundles[language];
}
