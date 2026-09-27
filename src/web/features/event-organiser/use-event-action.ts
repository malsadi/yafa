import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { EVENTS_KEY } from './event-keys';

/** Any change to an event, its tasks, budget, files or templates; every event view refreshes after. */
export function useEventAction<T = unknown>() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body?: object }) =>
      request<T>(p.path, { method: p.method, body: p.body ?? {} }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}
