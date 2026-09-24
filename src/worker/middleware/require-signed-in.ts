import type { MiddlewareHandler } from 'hono';
import type { ClerkVerificationKeys } from './verify-clerk-session-token';
import { verifyClerkSessionToken } from './verify-clerk-session-token';
import { resolveSessionState } from './resolve-session-state';
import type { SessionState } from './session-state';

export interface SignedInVariables {
  sessionState: SessionState;
}

/**
 * D-004's "signed-in-only" route class: requires a valid Clerk session
 * (401 if not) but never enforces `active`/notice-acknowledged beyond
 * that — `/api/me` uses this so it can report whichever state applies,
 * rather than being blocked by the very state it exists to report
 * (the same trap `maintenanceModeGate`'s own off-switch route avoids).
 */
export function requireSignedIn(
  db: D1Database,
  keys: ClerkVerificationKeys,
): MiddlewareHandler<{ Variables: SignedInVariables }> {
  return async (c, next) => {
    const session = await verifyClerkSessionToken(c.req.raw, keys);
    const sessionState = await resolveSessionState(db, session);
    c.set('sessionState', sessionState);
    await next();
  };
}
