import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { treasuryPath } from './treasury.api';
import { useTreasuryAction } from './use-treasury-action';
import { useTreasuryDownload } from './use-treasury-download';

/** Brief 17 C2, 9.4 and P9: the statement as a PDF in the officer's language, and filing it to the archive. */
export function StatementActions(props: {
  unitId: string;
  accountId: string;
  period: { from: string; to: string };
}) {
  const t = useText().services.treasury;
  const { language } = useLanguage();
  const { context } = useActiveSession();
  const download = useTreasuryDownload();
  const file = useTreasuryAction(props.unitId);
  const { from, to } = props.period;
  const pdf = `${treasuryPath(props.unitId)}/accounts/${props.accountId}/statement/pdf?from=${from}&to=${to}&language=${language}`;
  return (
    <div className="flex flex-col gap-2">
      <ErrorAlert error={download.error ?? file.error} refusals={t.refusals} />
      {file.isSuccess && <p role="status">{t.statements.filed}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={download.isPending}
          className="rounded border border-slate-400 px-3 py-1"
          onClick={() => {
            download.mutate({ path: pdf, fileName: `statement-${from}-${to}.pdf` });
          }}
        >
          {t.statements.download}
        </button>
        {context.capabilities.includes('treasury.statements.file') && (
          <button
            type="button"
            disabled={file.isPending}
            className="rounded border border-slate-400 px-3 py-1"
            onClick={() => {
              file.mutate({
                path: `/accounts/${props.accountId}/statement/file`,
                body: { from, to, language },
              });
            }}
          >
            {t.statements.file}
          </button>
        )}
      </div>
    </div>
  );
}
