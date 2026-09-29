import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { AccessCheckResult } from './access-check-result';
import { useAccessCheck } from './use-access-check';
import { ErrorAlert } from '../../../components/error-alert';

/** Brief 25 A4: pick an officer and see their permissions. Never their data; no impersonation. */
export function AccessCheckPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.accessCheck;
  const { people, personId, setPersonId, check } = useAccessCheck();
  if (people.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (people.isError) return <ErrorAlert error={people.error} />;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['access-check']}</PageHeading>
        <p className="max-w-prose">{t.intro}</p>
      </div>
      <label className="flex flex-col gap-1">
        <span>{t.officer}</span>
        <select
          className="max-w-md rounded border border-slate-400 p-2"
          value={personId}
          onChange={(event) => {
            setPersonId(event.target.value);
          }}
        >
          <option value="">{t.chooseOfficer}</option>
          {people.data.map((person) => (
            <option key={person.personId} value={person.personId}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      {check.isFetching && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      <ErrorAlert error={check.error} />
      {check.data && !check.isFetching && <AccessCheckResult check={check.data} />}
    </div>
  );
}
