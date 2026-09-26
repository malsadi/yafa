import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchClashes } from './calendar.api';
import { CALENDAR_KEY } from './calendar-keys';

const isDay = (text: string) => /^\d{4}-\d{2}-\d{2}$/.test(text);

/**
 * Brief 19 B4 and D-151: the unit's meetings and events on every day a date
 * covers — a notice, never a block. A last day before the first asks nothing.
 */
export function useClashes(unitId: string, date: string, lastDate: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...CALENDAR_KEY, unitId, 'clashes', date, lastDate],
    queryFn: () => fetchClashes(request, unitId, date, lastDate),
    enabled: isDay(date) && isDay(lastDate) && lastDate >= date,
  });
}
