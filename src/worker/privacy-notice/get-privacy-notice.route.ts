import type { Hono } from 'hono';
import { ForbiddenError, NotFoundError } from '../core/errors';
import { registerRoute } from '../core/permissions';
import { getCurrentPrivacyNoticeVersion } from '../core/privacy-notice';
import type { ClerkVerificationKeys, SignedInVariables } from '../middleware';
import { requireSignedIn } from '../middleware';

/**
 * The current privacy notice, in both languages (brief section 13: shown on
 * first sign-in and from the footer). Signed-in-only (D-004), since the
 * officer must read it before they are active; a signed-in user with no
 * linked person holding a current term sees only "access not active"
 * (brief section 6.2), so gets a 404 here. 404 too when no notice is set.
 */
export function registerGetPrivacyNoticeRoute(
  app: Hono<{ Variables: SignedInVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: '/api/privacy-notice', access: { kind: 'signed-in-only' } });

  app.get('/api/privacy-notice', requireSignedIn(db, keys), async (c) => {
    const { status } = c.get('sessionState');
    if (status === 'not-active') {
      throw new NotFoundError('privacy-notice.not-found');
    }
    if (status === 'second-factor-required') {
      throw new ForbiddenError('session.second-factor-required');
    }
    const notice = await getCurrentPrivacyNoticeVersion(db);
    if (!notice) {
      throw new NotFoundError('privacy-notice.not-set');
    }
    return c.json(notice);
  });
}
