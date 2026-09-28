import { useParams } from 'react-router';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { FinaliseControl } from './finalise-control';
import { ReportDownload } from './report-download';
import { ReportSections } from './report-sections';
import { ReportSummaryForm } from './report-summary-form';
import { useAchievementUnit, useReport } from './use-achievement-queries';

/** Brief 24 B2 and D-215: one year's report — a draft to review and finalise, or the finalised record. */
export function AnnualReportPage() {
  const { unitId } = useAchievementUnit();
  const { reportId = '' } = useParams();
  const text = useText();
  const t = text.services['achievements-and-reports'];
  const timestamp = useFormatTimestamp();
  const { context } = useActiveSession();
  const report = useReport(unitId, reportId);
  if (report.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (report.isError) return <ErrorAlert error={report.error} refusals={t.refusals} />;
  const r = report.data;
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('achievements-and-reports.annual-report.manage');
  const draft = r.status === 'Draft';
  return (
    <article className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">
        {fillText(t.reports.report, { year: String(r.year) })}
      </h2>
      <span className="self-start rounded bg-slate-100 px-2 text-sm">
        {t.reports.statuses[r.status]}
      </span>
      {draft && <p className="text-sm text-slate-600">{t.reports.draftNote}</p>}
      {!draft && r.finalisedAt && (
        <p className="text-sm">
          {fillText(t.reports.finalisedOn, {
            date: timestamp(r.finalisedAt),
            name: r.finalisedByName ?? '',
          })}
        </p>
      )}
      {!draft && <ReportDownload unitId={unitId} reportId={r.id} year={r.year} />}
      {draft && manages && <ReportSummaryForm report={r} />}
      <ReportSections content={r.content} />
      {draft && manages && <FinaliseControl report={r} />}
    </article>
  );
}
