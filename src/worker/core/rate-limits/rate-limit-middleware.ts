import type { MiddlewareHandler } from 'hono';
import { limitersOf, limitRequest } from './rate-limiters';

/**
 * Brief 12 and O-163: the limits that need no sign-in — the calendar feed,
 * per link (60 a minute), and the Clerk webhook (120 a minute).
 */
export const calendarFeedRateLimit: MiddlewareHandler = async (c, next) => {
  await limitRequest(limitersOf(c.env).CALENDAR_FEED_RATE_LIMITER, c.req.param('token') ?? 'feed');
  await next();
};

export const webhookRateLimit: MiddlewareHandler = async (c, next) => {
  await limitRequest(limitersOf(c.env).WEBHOOK_RATE_LIMITER, 'clerk');
  await next();
};
