import { PageHeading } from '../../../components/page-heading';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { AdminTextForm } from '../admin-texts/admin-text-form';
import { NoticeVersions } from './notice-versions';
import { PublishNoticeForm } from './publish-notice-form';
import { TextSection } from './text-section';
import { useTexts } from './use-texts';

/** Brief 25 C5: the privacy notice, the "access not active" message and the help text. */
export function TextsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.texts;
  const { view, save, refusal } = useTexts();
  if (view.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (view.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const { privacyNotice, accessNotActive, help } = view.data;
  return (
    <div className="flex flex-col gap-6">
      <PageHeading>{admin.screens.texts}</PageHeading>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      <TextSection title={t.privacyNotice} intro={t.privacyNoticeIntro}>
        <NoticeVersions versions={privacyNotice} />
        <PublishNoticeForm
          key={privacyNotice[0]?.id ?? 'none'}
          current={privacyNotice[0] ?? null}
          busy={save.isPending}
          onPublish={(notice) => {
            save.mutate({ kind: 'privacy-notice', text: notice });
          }}
        />
      </TextSection>
      <TextSection title={t.accessNotActive} intro={t.accessNotActiveIntro}>
        <AdminTextForm
          key={JSON.stringify(accessNotActive)}
          text={accessNotActive}
          busy={save.isPending}
          onSave={(message) => {
            save.mutate({ kind: 'access-not-active', text: message });
          }}
        />
      </TextSection>
      <TextSection title={t.help} intro={t.helpIntro}>
        <AdminTextForm
          key={JSON.stringify(help)}
          text={help}
          busy={save.isPending}
          onSave={(helpText) => {
            save.mutate({ kind: 'help', text: helpText });
          }}
        />
      </TextSection>
    </div>
  );
}
