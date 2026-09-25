import { Link } from 'react-router';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { useActiveSession } from '../../../app/session/use-active-session';
import { useFormatDate } from '../use-format-date';
import { useRegisterUnit } from '../use-register-unit';
import { RecordElectionForm } from './record-election-form';
import { useElections } from './use-elections';

/** Brief 14 C1: the unit's elections, newest first, and recording a new one. */
export function ElectionsPage() {
  const unit = useRegisterUnit();
  const text = useText();
  const t = text.services['committee-register'].elections;
  const formatDate = useFormatDate();
  const canRecord =
    useActiveSession().context.capabilities.includes('committee-register.elections.manage') &&
    unit.status === 'active';
  const { elections, record, refusal } = useElections(unit.id);
  if (elections.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (elections.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const refusals: Partial<Record<string, string>> = t.refusals;
  return (
    <div className="flex flex-col gap-4">
      {elections.data.length === 0 ? (
        <p>{t.noElections}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {elections.data.map((e) => (
            <li key={e.id}>
              <Link to={e.id} className="underline">
                {formatDate(e.electionDate)} · {t.statuses[e.status]}
                {e.correctsElectionId && ` · ${t.correction}`}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {refusal && (
        <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
          {refusals[refusal] ?? text.portalShell.somethingWentWrong}
        </p>
      )}
      {canRecord && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{t.recordHeading}</h2>
          <RecordElectionForm
            elections={elections.data}
            busy={record.isPending}
            onRecord={(input) => {
              record.mutate(input);
            }}
          />
        </section>
      )}
    </div>
  );
}
