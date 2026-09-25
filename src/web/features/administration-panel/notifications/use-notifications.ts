import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationsView } from '../../../../shared/administration-panel/notifications';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';

const PATH = '/api/administration-panel/notifications';
const KEY = ['notifications-defaults'] as const;

/** Brief 25 C4: the defaults, and saving either part. */
export function useNotifications() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const view = useQuery({ queryKey: KEY, queryFn: () => request<NotificationsView>(PATH) });
  const save = useMutation({
    mutationFn: (p: { part: 'alert-types' | 'install-guide'; body: unknown }) =>
      request<unknown>(`${PATH}/${p.part}`, { method: 'PUT', body: p.body }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
  const refusal =
    save.error instanceof ApiError ? save.error.code : save.error ? 'server.error' : null;
  return { view, save, refusal };
}
