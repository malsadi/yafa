import { useState } from 'react';
import type { AnnualReportRecord } from '../../../shared/achievements-and-reports/annual-report';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { reportPath } from './achievements.api';
import { useAchievementAction } from './use-achievement-queries';

/** O-157: the branch's review — its own summary, the one part of a draft written by hand. */
export function ReportSummaryForm({ report }: { report: AnnualReportRecord }) {
  const t = useText().services['achievements-and-reports'];
  const save = useAchievementAction();
  const [summary, setSummary] = useState(report.summary ?? '');
  const unchanged = summary === (report.summary ?? '');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate({
          path: `${reportPath(report.unitId, report.id)}/summary`,
          method: 'PUT',
          body: { summary: summary.trim() || null, version: report.version },
        });
      }}
    >
      <label className="flex flex-col gap-1">
        <span>{t.reports.summaryLabel}</span>
        <textarea
          rows={5}
          className="rounded border border-slate-400 p-2"
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
          }}
        />
      </label>
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <button
        type="submit"
        className="self-start rounded border border-slate-400 px-3 py-1"
        disabled={save.isPending || unchanged}
      >
        {unchanged && save.isSuccess ? t.reports.saved : t.reports.saveSummary}
      </button>
    </form>
  );
}
