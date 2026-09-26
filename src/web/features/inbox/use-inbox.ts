import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InboxView } from '../../../shared/core/inbox';
import { useApiRequest } from '../../app/api/use-api-request';

export const INBOX_KEY = ['inbox'] as const;

/** Brief 9.5 and D-031: the officer's own notifications, and marking them read. */
export function useInbox() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: INBOX_KEY });
  const inbox = useQuery({
    queryKey: INBOX_KEY,
    queryFn: () => request<InboxView>('/api/notifications'),
  });
  const markRead = useMutation({
    mutationFn: (id: string) =>
      request<undefined>(`/api/notifications/${id}/read`, { method: 'POST', body: {} }),
    onSettled: refresh,
  });
  const markAllRead = useMutation({
    mutationFn: () =>
      request<undefined>('/api/notifications/read-all', { method: 'POST', body: {} }),
    onSettled: refresh,
  });
  return { inbox, markRead, markAllRead };
}
