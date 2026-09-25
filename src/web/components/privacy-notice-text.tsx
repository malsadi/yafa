import type { PrivacyNotice } from '../app/session/privacy-notice.api';
import { privacyNoticeTextFor } from '../app/session/privacy-notice-text-for';
import { useLanguage } from '../app/language/use-language';

/**
 * The administrator's notice in the officer's language (brief section 8.5:
 * stored in both), shown as typed with its own direction. D-022: while the
 * Arabic isn't written, the English shows.
 */
export function PrivacyNoticeText({ notice }: { notice: PrivacyNotice }) {
  const { language } = useLanguage();
  const body = privacyNoticeTextFor(notice, language);
  return (
    <div dir="auto" className="whitespace-pre-wrap">
      {body}
    </div>
  );
}
