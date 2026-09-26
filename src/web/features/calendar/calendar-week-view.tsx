import { CalendarItemChip } from './calendar-item-chip';
import type { PeriodViewProps } from './calendar-period-view';
import { daysBetween } from './calendar-period';
import { itemsOnDay } from './items-on-day';
import { useCalendarDates } from './use-calendar-dates';

/** Brief 19 B1: the week, Monday to Sunday, each day with its items. */
export function CalendarWeekView(props: PeriodViewProps) {
  const { weekdayOf, dayNumber } = useCalendarDates();
  return (
    <ol className="grid gap-2 md:grid-cols-7">
      {daysBetween(props.period.from, props.period.to).map((day) => (
        <li key={day} className="flex min-h-24 flex-col gap-1 rounded border border-slate-300 p-1">
          <span className="text-sm font-medium">
            {weekdayOf(day)} {dayNumber(day)}
          </span>
          {itemsOnDay(props.items, day).map((item) => (
            <CalendarItemChip
              key={`${item.kind}:${item.id}`}
              item={item}
              showUnit={props.showUnit}
              onChoose={props.onChoose}
            />
          ))}
        </li>
      ))}
    </ol>
  );
}
