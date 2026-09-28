import { TooManyRequestsError } from '../errors';

/** Brief 12 and D-217 (O-163): the rate limiter bindings, from `wrangler.jsonc`. */
export interface RateLimiterBindings {
  UPLOAD_RATE_LIMITER?: RateLimit;
  SESSION_RATE_LIMITER?: RateLimit;
  CALENDAR_FEED_RATE_LIMITER?: RateLimit;
  WEBHOOK_RATE_LIMITER?: RateLimit;
}

/**
 * One request counted against a limiter for `key` — an officer, a feed
 * link, or the webhook. Over the limit, it is refused with 429 ("too many
 * requests, try again shortly"). Where no limiter is bound (the tests), it passes.
 */
export async function limitRequest(limiter: RateLimit | undefined, key: string): Promise<void> {
  if (!limiter) return;
  const { success } = await limiter.limit({ key });
  if (!success) throw new TooManyRequestsError('rate-limit.too-many');
}

/** The bindings from a request's environment, where it has one. */
export function limitersOf(env: unknown): RateLimiterBindings {
  return typeof env === 'object' && env !== null ? env : {};
}
