import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { AdministratorList } from './administrator-list';
import { AppointAdministratorForm } from './appoint-administrator-form';
import { useSystemAdministrators } from './use-system-administrators';

// P21 (D-042): at least two always remain; the server and a trigger enforce
// it, and the screen hides removal when it would be refused.
const MINIMUM_SYSTEM_ADMINISTRATORS = 2;

/** Brief 25 A1: appoint and remove system administrators. */
export function SystemAdministratorsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.systemAdministrators;
  const { administrators, candidates, appoint, remove, refusal } = useSystemAdministrators();
  if (administrators.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (administrators.isError) {
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  }
  const busy = appoint.isPending || remove.isPending;
  const canRemove = administrators.data.length > MINIMUM_SYSTEM_ADMINISTRATORS;
  const refusals: Partial<Record<string, string>> = t.refusals;
  const refusalText = refusal ? (refusals[refusal] ?? text.portalShell.somethingWentWrong) : null;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['system-administrators']}</PageHeading>
        <p className="max-w-prose">{t.intro}</p>
        {refusalText && (
          <p role="alert" className="mt-2 rounded bg-amber-100 p-3 text-amber-950">
            {refusalText}
          </p>
        )}
      </div>
      <AdministratorList
        administrators={administrators.data}
        canRemove={canRemove}
        busy={busy}
        onRemove={(personId) => {
          remove.mutate(personId);
        }}
      />
      {!canRemove && <p className="text-sm text-slate-600">{t.minimumNote}</p>}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{t.appointHeading}</h2>
        <AppointAdministratorForm
          candidates={candidates.data ?? []}
          busy={busy}
          onAppoint={(personId) => {
            appoint.mutate(personId);
          }}
        />
      </section>
    </div>
  );
}
