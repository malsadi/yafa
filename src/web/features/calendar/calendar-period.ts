import { addDaysToDate } from '../../../shared/core/add-days-to-date';

export type CalendarViewKind = 'month' | 'week' | 'list';

/** 0 for Monday to 6 for Sunday: a UK week begins on Monday. */
export function weekdayIndex(date: string): number {
  return (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
}

const monthStart = (date: string) => `${date.slice(0, 7)}-01`;
function monthEnd(date: string): string {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, month ?? 1, 0)).toISOString().slice(0, 10);
}

/** Brief 19 B1: the days a view shows around `anchor` — a month (whole weeks), a week, or a month as a list. */
export function periodFor(view: CalendarViewKind, anchor: string): { from: string; to: string } {
  if (view === 'week') {
    const from = addDaysToDate(anchor, -weekdayIndex(anchor));
    return { from, to: addDaysToDate(from, 6) };
  }
  if (view === 'list') return { from: monthStart(anchor), to: monthEnd(anchor) };
  const from = addDaysToDate(monthStart(anchor), -weekdayIndex(monthStart(anchor)));
  const last = monthEnd(anchor);
  return { from, to: addDaysToDate(last, 6 - weekdayIndex(last)) };
}

/** The next or previous period's anchor. */
export function moveAnchor(view: CalendarViewKind, anchor: string, step: 1 | -1): string {
  if (view === 'week') return addDaysToDate(anchor, 7 * step);
  const [year, month] = anchor.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1 + step, 1)).toISOString().slice(0, 10);
}

/** Every day from `from` to `to`, in order. */
export function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDaysToDate(day, 1)) days.push(day);
  return days;
}
