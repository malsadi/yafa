import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { moveAnchor } from './calendar-period';
import type { CalendarState } from './use-calendar-state';
import { useCalendarDates } from './use-calendar-dates';

/** The period shown — a month, or the week from its Monday — with earlier and later. */
export function CalendarPeriodNav(props: { state: CalendarState }) {
  const t = useText().services.calendar;
  const { monthTitle } = useCalendarDates();
  const formatDate = useFormatDate();
  const s = props.state;
  const title =
    s.view === 'week'
      ? fillText(t.weekOf, { date: formatDate(s.period.from) })
      : monthTitle(s.anchor);
  const step = (by: 1 | -1, label: string) => (
    <button
      type="button"
      className="rounded border border-slate-400 px-3 py-1"
      onClick={() => {
        s.setAnchor(moveAnchor(s.view, s.anchor, by));
      }}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-3">
      {step(-1, t.previous)}
      <h2 className="text-lg font-semibold">{title}</h2>
      {step(1, t.next)}
    </div>
  );
}
