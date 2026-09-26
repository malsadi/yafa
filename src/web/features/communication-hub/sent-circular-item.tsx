import type { SentCircular } from '../../../shared/communication-hub/circular-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { CircularReadConfirmation } from './circular-read-confirmation';

/** One circular the General Council sent: who sent it when, to whom, its text, and its read confirmation (A4). */
export function SentCircularItem(props: { circular: SentCircular }) {
  const t = useText().services['communication-hub'].circulars;
  const formatTimestamp = useFormatTimestamp();
  const c = props.circular;
  return (
    <li className="flex flex-col gap-1 rounded border border-slate-300 p-3">
      <h3 className="font-semibold">{c.title}</h3>
      <p className="text-sm text-slate-600">
        {fillText(t.sentBy, { name: c.sentByName, date: formatTimestamp(c.sentAt) })} ·{' '}
        {c.toAllBranches ? t.toAll : t.toChosen}
      </p>
      <p className="whitespace-pre-line">{c.body}</p>
      <CircularReadConfirmation circular={c} />
    </li>
  );
}
