import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useClashes } from './use-clashes';

/** Brief 19 B4 and D-149: the unit's other meetings and events on the chosen day — a notice only, never a block. */
export function ClashNotice(props: { unitId: string; date: string }) {
  const t = useText().services.calendar;
  const clashes = useClashes(props.unitId, props.date);
  if (!clashes.data?.length) return null;
  const items = clashes.data
    .map((c) => `${t.kinds[c.kind]}: ${c.title}${c.startTime ? ` (${c.startTime})` : ''}`)
    .join('; ');
  return (
    <p role="status" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm">
      {fillText(t.clash, { items })}
    </p>
  );
}
