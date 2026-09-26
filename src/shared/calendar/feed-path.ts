/**
 * Brief 6.4 and 19 C1: the phone calendar feed's address for a token. It
 * sits outside `/api`, like the other files a device fetches without a
 * sign-in (D-088), and is declared with its own access class (D-004).
 */
export const CALENDAR_FEED_PATH = '/calendar/feed/:token';

export function calendarFeedPath(token: string): string {
  return CALENDAR_FEED_PATH.replace(':token', token);
}

/** Brief 6.4: whether the officer has a feed token, and since when — never the token itself. */
export interface FeedTokenStatus {
  createdAt: string | null;
}
