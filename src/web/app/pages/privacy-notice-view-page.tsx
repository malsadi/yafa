import { PageHeading } from '../../components/page-heading';
import { PrivacyNoticeText } from '../../components/privacy-notice-text';
import { StatusMessage } from '../../components/status-message';
import { useText } from '../language/use-text';
import { usePrivacyNotice } from '../session/use-privacy-notice';

/** Brief section 13: the privacy notice, from the footer, read-only. */
export function PrivacyNoticeViewPage() {
  const text = useText();
  const notice = usePrivacyNotice();
  if (notice.isPending) {
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  }
  if (notice.isError) {
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  }
  return (
    <section>
      <PageHeading>{text.portalShell.privacyNotice.title}</PageHeading>
      <PrivacyNoticeText notice={notice.data} />
    </section>
  );
}
