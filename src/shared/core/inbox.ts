/** Brief 9.5 and D-031: one in-portal notification — its kind a code, its details for the kind's text. */
export interface InboxItem {
  id: string;
  kind: string;
  params: Record<string, string | number> | null;
  readAt: string | null;
  createdAt: string;
}

/** D-031: the officer's own notifications, newest first, and how many are unread. */
export interface InboxView {
  items: InboxItem[];
  unreadCount: number;
  /** D-217: the page shown, from 1, and how many there are. */
  page: number;
  pageCount: number;
}
