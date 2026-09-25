import { PageHeading } from '../../../components/page-heading';
import { RefusalAlert } from '../../../components/refusal-alert';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { AdminTextForm } from '../admin-texts/admin-text-form';
import { AlertTypesForm } from './alert-types-form';
import { useNotifications } from './use-notifications';

/** Brief 25 C4: the alert types new officers start with, and the iPhone install guide. */
export function NotificationsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.notifications;
  const { view, save, refusal } = useNotifications();
  if (view.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (view.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <div className="flex flex-col gap-6">
      <PageHeading>{admin.screens.notifications}</PageHeading>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t.alertTypes}</h2>
        <p className="max-w-prose">{t.alertTypesIntro}</p>
        <AlertTypesForm
          key={JSON.stringify(view.data.alertTypesForNewOfficers)}
          chosen={view.data.alertTypesForNewOfficers}
          busy={save.isPending}
          onSave={(types) => {
            save.mutate({ part: 'alert-types', body: { types } });
          }}
        />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t.installGuide}</h2>
        <p className="max-w-prose">{t.installGuideIntro}</p>
        <AdminTextForm
          key={JSON.stringify(view.data.installGuide)}
          text={view.data.installGuide}
          busy={save.isPending}
          onSave={(guide) => {
            save.mutate({ part: 'install-guide', body: guide });
          }}
        />
      </section>
    </div>
  );
}
