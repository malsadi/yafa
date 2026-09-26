import { CalendarItemChip } from './calendar-item-chip';
import type { PeriodViewProps } from './calendar-period-view';
import { daysBetween } from './calendar-period';
import { itemsOnDay } from './items-on-day';
import { useCalendarDates } from './use-calendar-dates';

/** Brief 19 B1: the month in whole weeks, Monday first, each day with its items. */
export function CalendarMonthGrid(props: PeriodViewProps) {
  const { weekdays, dayNumber } = useCalendarDates();
  return (
    <div role="table" className="grid grid-cols-7 gap-px overflow-x-auto bg-slate-300 text-sm">
      {weekdays.map((name) => (
        <div role="columnheader" key={name} className="bg-slate-100 p-1 text-center font-medium">
          {name}
        </div>
      ))}
      {daysBetween(props.period.from, props.period.to).map((day) => (
        <div role="cell" key={day} className="flex min-h-20 flex-col gap-1 bg-white p-1">
          <span className="text-xs text-slate-600">{dayNumber(day)}</span>
          {itemsOnDay(props.items, day).map((item) => (
            <CalendarItemChip
              key={`${item.kind}:${item.id}`}
              item={item}
              showUnit={props.showUnit}
              onChoose={props.onChoose}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
