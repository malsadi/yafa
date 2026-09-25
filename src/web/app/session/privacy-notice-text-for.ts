import type { Language } from '../../../shared/core/languages';
import { inLanguage } from '../language/in-language';
import type { PrivacyNotice } from './privacy-notice.api';

/** The notice in the officer's language, or in English while the Arabic isn't written (D-022). */
export function privacyNoticeTextFor(notice: PrivacyNotice, language: Language): string {
  return inLanguage(notice, language);
}
