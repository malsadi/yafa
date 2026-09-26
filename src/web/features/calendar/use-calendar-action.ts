import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { CALENDAR_KEY } from './calendar-keys';

/** A change to a community date, or a new feed link; every calendar view refreshes after. */
export function useCalendarAction<T = unknown>() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body: object }) =>
      request<T>(p.path, { method: p.method, body: p.body }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CALENDAR_KEY }),
  });
}
