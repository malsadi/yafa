import type { Hono } from 'hono';
import { CALENDAR_FEED_PATH } from '../../../../shared/calendar/feed-path';
import { registerRoute } from '../../../core/permissions';
import { calendarFeedRateLimit } from '../../../core/rate-limits';
import { calendarFeed } from './feed.service';

/**
 * Brief 6.4 and 19 C1: the phone calendar feed. It cannot use Clerk, so its
 * access is its token (D-004's "calendar feed token" class): a long random
 * one, checked by its hash, revocable.
 */
export function registerCalendarFeedRoute(app: Hono, db: D1Database): void {
  registerRoute({
    method: 'GET',
    path: CALENDAR_FEED_PATH,
    access: { kind: 'calendar-feed-token' },
  });
  app.get(CALENDAR_FEED_PATH, calendarFeedRateLimit, async (c) => {
    const ics = await calendarFeed(
      db,
      c.req.param('token'),
      c.req.header('Accept-Language') ?? null,
    );
    return c.body(ics, 200, {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  });
}
