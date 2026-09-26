import type { FeedTokenStatus } from '../../../shared/calendar/feed-path';
import type { CalendarView, ClashNotice } from '../../../shared/calendar/calendar-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitCalendarPath = (unitId: string) => `/api/calendar/units/${unitId}`;

/** Brief 19 B1 and B2: a period, of the unit's own calendar or of all branches. The filters (B3) apply on the page. */
export interface CalendarQuery {
  from: string;
  to: string;
  scope: 'branch' | 'all';
}

export function fetchCalendar(request: Request, unitId: string, q: CalendarQuery) {
  const params = new URLSearchParams({ from: q.from, to: q.to, scope: q.scope });
  return request<CalendarView>(`${unitCalendarPath(unitId)}/items?${params.toString()}`);
}

/** D-151: every day from the first to the last is checked. */
export function fetchClashes(request: Request, unitId: string, date: string, lastDate: string) {
  const params = new URLSearchParams({ date, lastDate });
  return request<ClashNotice[]>(`${unitCalendarPath(unitId)}/clashes?${params.toString()}`);
}

export const fetchFeedToken = (request: Request) =>
  request<FeedTokenStatus>('/api/calendar/feed-token');
