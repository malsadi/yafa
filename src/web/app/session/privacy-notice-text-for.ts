import type { Language } from '../../../shared/core/languages';
import type { PrivacyNotice } from './privacy-notice.api';

/** The notice in one language, or null if the administrator has not entered it. */
export function privacyNoticeTextFor(notice: PrivacyNotice, language: Language): string | null {
  return { en: notice.textEn, ar: notice.textAr }[language];
}
