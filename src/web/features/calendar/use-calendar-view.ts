import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchCalendar, type CalendarQuery } from './calendar.api';
import { CALENDAR_KEY } from './calendar-keys';

/** Brief 19 B1 and B2: the calendar for a period and scope; the last one stays shown while the next loads. */
export function useCalendarView(unitId: string, query: CalendarQuery) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...CALENDAR_KEY, unitId, query],
    queryFn: () => fetchCalendar(request, unitId, query),
    placeholderData: keepPreviousData,
  });
}
