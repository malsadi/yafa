import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  fetchCircularBranches,
  fetchReceivedCirculars,
  fetchSentCirculars,
  openCircular,
} from './hub.api';
import { HUB_KEY } from './hub-keys';

/** Brief 20 A3: the circulars the branch received, with when it first opened each (P14). */
export function useReceivedCirculars(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'circulars'],
    queryFn: () => fetchReceivedCirculars(request, unitId),
  });
}

/** Brief 20 A4 and P14: one circular, opened — which records the branch's first opening. */
export function useOpenedCircular(unitId: string, circularId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'circular', circularId],
    queryFn: async () => {
      const circular = await openCircular(request, unitId, circularId);
      await queryClient.invalidateQueries({ queryKey: [...HUB_KEY, unitId, 'circulars'] });
      return circular;
    },
  });
}

/** Brief 20 A3 and A4: what the General Council sent, and which branches have opened each. */
export function useSentCirculars(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'sent-circulars'],
    queryFn: () => fetchSentCirculars(request, unitId),
  });
}

/** The branches a circular can be sent to. */
export function useCircularBranches(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...HUB_KEY, unitId, 'circular-branches'],
    queryFn: () => fetchCircularBranches(request, unitId),
  });
}
