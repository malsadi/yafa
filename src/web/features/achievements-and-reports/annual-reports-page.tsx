import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { StartReport } from './start-report';
import { useAchievementUnit, useReports } from './use-achievement-queries';

/** Brief 24 B2, O-157 and D-216: the unit's annual reports, and starting any ended year's. */
export function AnnualReportsPage() {
  const { unitId } = useAchievementUnit();
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const { context } = useActiveSession();
  const reports = useReports(unitId);
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('achievements-and-reports.annual-report.manage');
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.reports.heading}</h2>
      {manages && reports.data && (
        <StartReport unitId={unitId} years={reports.data.startableYears} />
      )}
      <ErrorAlert error={reports.error} refusals={t.refusals} />
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
