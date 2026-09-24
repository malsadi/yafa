import { RIGHT_TO_LEFT_LANGUAGES, type Language } from '../../../shared/core/languages';

/** Brief section 8.5: direction is set on the `<html>` element. */
export function applyDocumentLanguage(root: HTMLElement, language: Language): void {
  root.lang = language;
  root.dir = RIGHT_TO_LEFT_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
}
