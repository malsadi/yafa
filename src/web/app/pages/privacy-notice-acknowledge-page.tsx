import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LanguageSwitcher } from '../../components/language-switcher';
import { PageHeading } from '../../components/page-heading';
import { PrivacyNoticeAcknowledgeForm } from '../../components/privacy-notice-acknowledge-form';
import { PrivacyNoticeText } from '../../components/privacy-notice-text';
import { StatusMessage } from '../../components/status-message';
import { ApiError } from '../api/api-error';
import { useApiRequest } from '../api/use-api-request';
import { useLanguage } from '../language/use-language';
import { useText } from '../language/use-text';
import { acknowledgePrivacyNotice } from '../session/privacy-notice.api';
import { privacyNoticeTextFor } from '../session/privacy-notice-text-for';
import { useChangeLanguage } from '../session/use-change-language';
import { ME_QUERY_KEY } from '../session/use-me';
import { usePrivacyNotice } from '../session/use-privacy-notice';

/**
 * D-005: on first sign-in, and again after the notice changes (D-016), the
 * officer ticks "I have read this" before continuing — only possible once
 * the notice has text in the language they are reading it in.
 */
export function PrivacyNoticeAcknowledgePage() {
  const text = useText();
  const { language } = useLanguage();
  const changeLanguage = useChangeLanguage(true);
  const notice = usePrivacyNotice();
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  if (notice.isPending) {
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  }
  if (notice.isError) {
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  }

  const onContinue = async () => {
    try {
      await acknowledgePrivacyNotice(request, notice.data.id);
    } catch (error) {
      const changed = error instanceof ApiError && error.code === 'privacy-notice.version-changed';
      setMessage(
        changed ? text.portalShell.privacyNotice.changed : text.portalShell.somethingWentWrong,
      );
      await notice.refetch();
    }
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
  };

  return (
    <main className="mx-auto flex max-w-prose flex-col gap-4 p-6">
      <LanguageSwitcher onChange={(next) => void changeLanguage(next)} />
      <PageHeading>{text.portalShell.privacyNotice.title}</PageHeading>
      {message && <p role="alert">{message}</p>}
      <PrivacyNoticeText notice={notice.data} />
      <PrivacyNoticeAcknowledgeForm
        readable={Boolean(privacyNoticeTextFor(notice.data, language))}
        onContinue={onContinue}
      />
    </main>
  );
}
