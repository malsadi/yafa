import { useFormatDate } from '../../app/language/use-format-date';
import { CalendarItemChip } from './calendar-item-chip';
import type { PeriodViewProps } from './calendar-period-view';

/** Brief 19 B1: the month's items as a list, in date order, each with its date or dates. */
export function CalendarListView(props: PeriodViewProps) {
  const formatDate = useFormatDate();
  return (
    <ul className="flex flex-col gap-2">
      {props.items.map((item) => (
        <li key={`${item.kind}:${item.id}`} className="flex flex-col gap-1 md:flex-row md:gap-3">
          <span className="text-sm md:w-64">
            {formatDate(item.startDate)}
            {item.endDate !== item.startDate && ` – ${formatDate(item.endDate)}`}
          </span>
          <span className="flex-1">
            <CalendarItemChip item={item} showUnit={props.showUnit} onChoose={props.onChoose} />
          </span>
        </li>
      ))}
    </ul>
  );
}
