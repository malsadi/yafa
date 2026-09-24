import type { MiddlewareHandler } from 'hono';
import { ForbiddenError } from '../core/errors';
import type { RequestContext } from '../core/permissions';
import type { ClerkVerificationKeys } from './verify-clerk-session-token';
import { verifyClerkSessionToken } from './verify-clerk-session-token';
import { resolveSessionState } from './resolve-session-state';

export interface ActiveAccessVariables {
  requestContext: RequestContext;
}

/**
 * Every `capability`-classed route (brief section 7.4) carries this: signed
 * in, linked to a person with a current term, and the current privacy
 * notice acknowledged — D-027, no exemption for system administrators.
 * `/api/me` (and the future privacy-notice-acknowledge route) must never
 * carry this middleware, the same way the maintenance-mode off-switch route
 * must never carry `maintenanceModeGate`.
 */
export function requireActiveAccess(
  db: D1Database,
  keys: ClerkVerificationKeys,
): MiddlewareHandler<{ Variables: ActiveAccessVariables }> {
  return async (c, next) => {
    const session = await verifyClerkSessionToken(c.req.raw, keys);
    const sessionState = await resolveSessionState(db, session);

    if (sessionState.status === 'not-active') {
      throw new ForbiddenError('access.not-active');
    }
    if (sessionState.status === 'second-factor-required') {
      throw new ForbiddenError('session.second-factor-required');
    }
    if (sessionState.status === 'notice-not-set') {
      throw new ForbiddenError('privacy-notice.not-set');
    }
    if (sessionState.status === 'notice-not-acknowledged') {
      throw new ForbiddenError('privacy-notice.not-acknowledged');
    }

    c.set('requestContext', sessionState.context);
    await next();
  };
}
