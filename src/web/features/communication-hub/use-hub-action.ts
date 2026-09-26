import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { HUB_KEY } from './hub-keys';

/** A change in the hub (a notice, a vote); every hub view refreshes after. */
export function useHubAction() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body: object }) =>
      request<unknown>(p.path, { method: p.method, body: p.body }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: HUB_KEY }),
  });
}
