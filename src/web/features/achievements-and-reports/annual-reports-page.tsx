import { Link, useNavigate } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { unitPath } from './achievements.api';
import { useAchievementAction, useAchievementUnit, useReports } from './use-achievement-queries';

/** Brief 24 B2 and O-157: the unit's annual reports, and starting the latest year's once it has ended. */
export function AnnualReportsPage() {
  const { unitId } = useAchievementUnit();
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const navigate = useNavigate();
  const { context } = useActiveSession();
  const reports = useReports(unitId);
  const start = useAchievementAction<{ id: string }>();
  const year = reports.data?.latestEndedYear ?? null;
  const manages = context.capabilities.includes('achievements-and-reports.annual-report.manage');
  const canStart = manages && year !== null && !reports.data?.reports.some((r) => r.year === year);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.reports.heading}</h2>
      {canStart && (
        <ActionButton
          label={fillText(t.reports.start, { year: String(year) })}
          disabled={start.isPending}
          onClick={() => {
            start.mutate(
              { path: `${unitPath(unitId)}/annual-reports`, method: 'POST', body: { year } },
              {
                onSuccess: ({ id }) =>
                  void navigate(`/achievements-and-reports/annual-reports/${id}`),
              },
            );
          }}
        />
      )}
      <ErrorAlert error={reports.error ?? start.error} refusals={t.refusals} />
      {reports.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {reports.data?.reports.length === 0 && <p>{t.reports.none}</p>}
      <ul className="flex flex-col gap-1">
        {reports.data?.reports.map((r) => (
          <li key={r.id} className="flex gap-3">
            <Link to={`/achievements-and-reports/annual-reports/${r.id}`} className="underline">
              {fillText(t.reports.report, { year: String(r.year) })}
            </Link>
            <span className="rounded bg-slate-100 px-2 text-sm">
              {t.reports.statuses[r.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
