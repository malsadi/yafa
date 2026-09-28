import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchNotices } from './hub.api';
import { HUB_KEY } from './hub-keys';

/** Brief 20 A1 and A2: the unit's Noticeboard, with each vote as this officer sees it. */
export function useNotices(unitId: string, page: number) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'notices', String(page)],
    queryFn: () => fetchNotices(request, unitId, page),
  });
}
