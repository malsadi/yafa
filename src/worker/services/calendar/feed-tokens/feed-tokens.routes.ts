import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { myFeedTokenStatus, regenerateMyFeedToken } from './feed-tokens.service';

const PATH = '/api/calendar/feed-token';
// D-004: each officer's own token — nothing to grant; the feed itself shows
// only what they may see.
const OWN = { kind: 'signed-in-only' } as const;

/** Brief 6.4 and 19 C1: the officer's own feed token — whether they have one, and a new one. HTTP only. */
export function registerFeedTokensRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: OWN });
  registerRoute({ method: 'POST', path: PATH, access: OWN });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await myFeedTokenStatus(db, c.get('requestContext'))));
  app.post(PATH, active, async (c) =>
    c.json(await regenerateMyFeedToken(db, c.get('requestContext')), 201),
  );
}
