import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchClashes } from './calendar.api';
import { CALENDAR_KEY } from './calendar-keys';

/** Brief 19 B4: the unit's meetings and events on a chosen day — a notice, never a block. */
export function useClashes(unitId: string, date: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...CALENDAR_KEY, unitId, 'clashes', date],
    queryFn: () => fetchClashes(request, unitId, date),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(date),
  });
}
