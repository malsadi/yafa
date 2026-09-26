import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useClashes } from './use-clashes';

/**
 * Brief 19 B4, D-149 and D-151: the unit's other meetings and events on any
 * day the date covers, each with its day — a notice only, never a block.
 */
export function ClashNotice(props: { unitId: string; date: string; lastDate: string }) {
  const t = useText().services.calendar;
  const formatDate = useFormatDate();
  const clashes = useClashes(props.unitId, props.date, props.lastDate);
  if (!clashes.data?.length) return null;
  const items = clashes.data
    .map(
      (c) =>
        `${formatDate(c.date)}, ${t.kinds[c.kind]}: ${c.title}${c.startTime ? ` (${c.startTime})` : ''}`,
    )
    .join('; ');
  return (
    <p role="status" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm">
      {fillText(t.clash, { items })}
    </p>
  );
}
