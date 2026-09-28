import type { AnnualReportRecord } from '../../../shared/achievements-and-reports/annual-report';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { reportPath } from './achievements.api';
import { useAchievementAction } from './use-achievement-queries';

/**
 * O-158 and P18: the confirmation before finalising — with the warning that
 * the Treasury figures will be marked provisional while the financial year
 * is open, which never blocks. The PDF is in the finalising officer's language (9.4).
 */
export function FinaliseDialog(props: { report: AnnualReportRecord; onCancel: () => void }) {
  const texts = useText().services['achievements-and-reports'];
  const t = texts.reports;
  const { language } = useLanguage();
  const finalise = useAchievementAction();
  const { report } = props;
  const provisional = report.content.treasury !== null && !report.content.treasury.closed;
  return (
    <div
      role="alertdialog"
      className="flex flex-col gap-2 rounded border border-amber-400 bg-amber-50 p-3"
    >
      <p>{fillText(t.finaliseConfirm, { year: String(report.year) })}</p>
      {provisional && <p className="font-medium">{t.provisionalWarning}</p>}
      <ErrorAlert error={finalise.error} refusals={texts.refusals} />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-2 text-white"
          disabled={finalise.isPending}
          onClick={() => {
            finalise.mutate({
              path: `${reportPath(report.unitId, report.id)}/finalise`,
              method: 'POST',
              body: { version: report.version, language },
            });
          }}
        >
          {finalise.isPending ? t.finalising : t.confirm}
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2"
          disabled={finalise.isPending}
          onClick={props.onCancel}
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
