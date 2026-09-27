import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { MEETINGS_KEY } from './meeting-keys';

/** Any change to a meeting; every meeting view refreshes after. */
export function useMeetingAction<T = unknown>() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body?: object }) =>
      request<T>(p.path, { method: p.method, body: p.body ?? {} }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: MEETINGS_KEY }),
  });
}
