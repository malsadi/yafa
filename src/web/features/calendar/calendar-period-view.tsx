import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { useText } from '../../app/language/use-text';
import { CalendarListView } from './calendar-list-view';
import { CalendarMonthGrid } from './calendar-month-grid';
import type { CalendarViewKind } from './calendar-period';
import { CalendarWeekView } from './calendar-week-view';

export interface PeriodViewProps {
  period: { from: string; to: string };
  items: CalendarItem[];
  showUnit: boolean;
  onChoose: (item: CalendarItem) => void;
}

/** Brief 19 B1: the period by month, week or list. */
export function CalendarPeriodView(props: PeriodViewProps & { view: CalendarViewKind }) {
  const t = useText().services.calendar;
  if (props.view === 'list') {
    return props.items.length === 0 ? <p>{t.none}</p> : <CalendarListView {...props} />;
  }
  return props.view === 'week' ? <CalendarWeekView {...props} /> : <CalendarMonthGrid {...props} />;
}
