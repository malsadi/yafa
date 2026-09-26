import type { CalendarItem } from '../../../shared/calendar/calendar-records';

/** The items that fall on a day: one-day items on it, and several-day items that span it. */
export function itemsOnDay(items: CalendarItem[], day: string): CalendarItem[] {
  return items.filter((item) => item.startDate <= day && day <= item.endDate);
}
