import type { Hono } from 'hono';
import { registerRoute } from '../core/permissions';
import type { ClerkVerificationKeys } from '../middleware/verify-clerk-session-token';
import { requireSignedIn, type SignedInVariables } from '../middleware/require-signed-in';

/**
 * D-004's "signed-in-only" class: reports the officer's own session state
 * (`not-active` / `notice-not-set` / `notice-not-acknowledged` / `active`)
 * so the web app knows which screen to show. Deliberately never enforces
 * `active` itself — see `requireSignedIn`'s own comment for why.
 */
export function registerGetMeRoute(
  app: Hono<{ Variables: SignedInVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } });

  app.get('/api/me', requireSignedIn(db, keys), (c) => {
    const sessionState = c.get('sessionState');
    if (sessionState.status === 'active') {
      return c.json({ status: sessionState.status, context: sessionState.context });
    }
    if (sessionState.status === 'notice-not-acknowledged') {
      return c.json({ status: sessionState.status, noticeVersionId: sessionState.noticeVersionId });
    }
    return c.json({ status: sessionState.status });
  });
}
