import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../api/use-api-request';
import { fetchMe } from './me.api';

export const ME_QUERY_KEY = ['me'] as const;

/** The signed-in officer's session state and shell data (T-067). */
export function useMe() {
  const request = useApiRequest();
  return useQuery({ queryKey: ME_QUERY_KEY, queryFn: () => fetchMe(request) });
}
