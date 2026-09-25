import type { ElectionRecord } from '../../../../shared/committee-register/election-record';
import { ElectionStatus } from '../../../../shared/committee-register/election-status';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { useFormatDate } from '../use-format-date';

/** An election's date, status, what it corrects, and any refusal of the last change. */
export function ElectionHeader(props: { election: ElectionRecord; refusal: string | null }) {
  const text = useText();
  const t = text.services['committee-register'].elections;
  const formatDate = useFormatDate();
  const e = props.election;
  const refusals: Partial<Record<string, string>> = t.refusals;
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold">
        {fillText(t.electionOf, { date: formatDate(e.electionDate) })} · {t.statuses[e.status]}
      </h2>
      {e.correctsElectionId && <p>{t.correction}</p>}
      {e.termsStartDate && (
        <p>{fillText(t.termsStarted, { date: formatDate(e.termsStartDate) })}</p>
      )}
      {e.status === ElectionStatus.Confirmed && (
        <p className="text-sm text-slate-600">{t.locked}</p>
      )}
      {props.refusal && (
        <p role="alert" className="rounded bg-amber-100 p-3 text-amber-950">
          {refusals[props.refusal] ?? text.portalShell.somethingWentWrong}
        </p>
      )}
    </div>
  );
}
