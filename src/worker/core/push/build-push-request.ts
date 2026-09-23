import { buildPushPayload } from '@block65/webcrypto-web-push';
import type { PushMessage, PushSubscription, VapidKeys } from '@block65/webcrypto-web-push';

export interface PushRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Uint8Array;
}

/**
 * VAPID keys are a parameter, never read from `env` here (T-019's "core
 * modules take their limits as parameters" pattern) — Phase 7's Queue
 * consumer owns reading the actual secret. `buildPushPayload` returns
 * everything but the destination; `subscription.endpoint` is that
 * destination, so the caller can `fetch(url, { method, headers, body })`
 * directly.
 *
 * `ttlSeconds` is required, not left to `message.options.ttl`:
 * `@block65/webcrypto-web-push`'s own `buildPushPayload` defaults a missing
 * *or falsy* TTL to 60 seconds (`message.options?.ttl || 60`), which would
 * silently swallow an explicit `ttl: 0` too. How long an undelivered phone
 * alert should be held is a portal decision the brief never states (O-016),
 * not a default this wrapper is entitled to inherit from a dependency
 * (rules 2 and 5) — every caller must say.
 */
export async function buildPushRequest(
  subscription: PushSubscription,
  message: PushMessage,
  vapid: VapidKeys,
  ttlSeconds: number,
): Promise<PushRequest> {
  if (!(ttlSeconds > 0)) {
    throw new Error('ttlSeconds must be a positive number of seconds');
  }
  const { headers, method, body } = await buildPushPayload(
    { ...message, options: { ...message.options, ttl: ttlSeconds } },
    subscription,
    vapid,
  );
  return { url: subscription.endpoint, method, headers, body };
}
