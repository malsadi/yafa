import type { PrivacyNotice } from '../app/session/privacy-notice.api';
import { privacyNoticeTextFor } from '../app/session/privacy-notice-text-for';
import { useLanguage } from '../app/language/use-language';
import { useText } from '../app/language/use-text';

/**
 * The administrator's notice in the officer's language (brief section 8.5:
 * stored in both). Text they typed is shown as typed, with its own
 * direction. A language with no text yet says so, never another's text.
 */
export function PrivacyNoticeText({ notice }: { notice: PrivacyNotice }) {
  const { language } = useLanguage();
  const text = useText();
  const body = privacyNoticeTextFor(notice, language);
  if (!body) {
    return <p>{text.portalShell.notConfigured}</p>;
  }
  return (
    <div dir="auto" className="whitespace-pre-wrap">
      {body}
    </div>
  );
}
