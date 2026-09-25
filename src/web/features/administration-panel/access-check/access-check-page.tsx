import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { AccessCheckResult } from './access-check-result';
import { useAccessCheck } from './use-access-check';

/** Brief 25 A4: pick an officer and see their permissions. Never their data; no impersonation. */
export function AccessCheckPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.accessCheck;
  const { people, personId, setPersonId, check } = useAccessCheck();
  if (people.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (people.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
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
      {check.isError && <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>}
      {check.data && !check.isFetching && <AccessCheckResult check={check.data} />}
    </div>
  );
}
