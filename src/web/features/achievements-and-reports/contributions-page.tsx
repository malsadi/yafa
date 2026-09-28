import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { useAchievementUnit, useContributors } from './use-achievement-queries';

/** Brief 24 B1: everyone who has served, past officers included, each opening their contributions. */
export function ContributionsPage() {
  const { unitId } = useAchievementUnit();
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const people = useContributors(unitId);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.contributions.heading}</h2>
      <ErrorAlert error={people.error} refusals={t.refusals} />
      {people.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {people.data?.length === 0 && <p>{t.contributions.none}</p>}
      <ul className="flex flex-col gap-1">
        {people.data?.map((p) => (
          <li key={p.personId}>
            <Link
              to={`/achievements-and-reports/contributions/${p.personId}`}
              className="underline"
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
