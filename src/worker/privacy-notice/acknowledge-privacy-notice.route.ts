import type { Hono } from 'hono';
import { z } from 'zod';
import { ConflictError, NotFoundError } from '../core/errors';
import { registerRoute } from '../core/permissions';
import { buildAcknowledgePrivacyNoticeStatement } from '../core/privacy-notice';
import type { ClerkVerificationKeys, SignedInVariables } from '../middleware';
import { requireSignedIn } from '../middleware';

const bodySchema = z.object({ noticeVersionId: z.string().min(1) });

/**
 * D-005: the officer ticks "I have read this"; the portal records who, when
 * and which version. Signed-in-only (D-004) — it must never carry
 * `requireActiveAccess`, which would block the very step it exists for.
 * The version must be the one the officer was shown and still current, so
 * a notice changed mid-read is never recorded as acknowledged.
 */
export function registerAcknowledgePrivacyNoticeRoute(
  app: Hono<{ Variables: SignedInVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'POST',
    path: '/api/privacy-notice/acknowledgements',
    access: { kind: 'signed-in-only' },
  });

  app.post('/api/privacy-notice/acknowledgements', requireSignedIn(db, keys), async (c) => {
    const sessionState = c.get('sessionState');
    if (sessionState.status === 'not-active' || sessionState.status === 'notice-not-set') {
      throw new NotFoundError('privacy-notice.not-found');
    }
    if (sessionState.status === 'active') {
      throw new ConflictError('privacy-notice.already-acknowledged');
    }
    const { noticeVersionId } = bodySchema.parse(await c.req.json());
    if (noticeVersionId !== sessionState.noticeVersionId) {
      throw new ConflictError('privacy-notice.version-changed');
    }
    await db.batch([
      buildAcknowledgePrivacyNoticeStatement(db, {
        personId: sessionState.personId,
        noticeVersionId,
      }),
    ]);
    return c.body(null, 204);
  });
}
