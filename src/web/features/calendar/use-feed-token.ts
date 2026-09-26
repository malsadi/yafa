import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchFeedToken } from './calendar.api';
import { CALENDAR_KEY } from './calendar-keys';

/** Brief 6.4: whether the officer has a phone calendar link, and since when. */
export function useFeedToken() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...CALENDAR_KEY, 'feed-token'],
    queryFn: () => fetchFeedToken(request),
  });
}
