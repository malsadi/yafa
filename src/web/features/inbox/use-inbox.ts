import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InboxView } from '../../../shared/core/inbox';
import { useApiRequest } from '../../app/api/use-api-request';

export const INBOX_KEY = ['inbox'] as const;

/** Brief 9.5 and D-031: the officer's own notifications, and marking them read. */
export function useInbox(page: number) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: INBOX_KEY });
  const inbox = useQuery({
    queryKey: [...INBOX_KEY, 'page', String(page)],
    queryFn: () => request<InboxView>(`/api/notifications?page=${String(page)}`),
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

/** D-031: how many notifications are unread, for the way to the inbox. */
export function useUnreadCount() {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...INBOX_KEY, 'unread'],
    queryFn: () => request<{ unreadCount: number }>('/api/notifications/unread-count'),
  });
}
