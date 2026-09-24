import type { Hono } from 'hono';
import { z } from 'zod';
import { NotFoundError } from '../core/errors';
import { registerRoute } from '../core/permissions';
import type { ClerkVerificationKeys, SignedInVariables } from '../middleware';
import { requireSignedIn } from '../middleware';
import { LANGUAGES } from '../../shared/core/languages';
import { updatePersonLanguage } from './me-repo';

const bodySchema = z.object({ language: z.enum(LANGUAGES) });

/**
 * Brief section 8.5: "each officer chooses their own language; it is saved
 * on their person record and used on every device." Signed-in-only (D-004),
 * like `/api/me`: an officer still on the privacy-notice screen must be
 * able to read it in their own language. Only ever writes the caller's own
 * record; a signed-in user with no linked person has no record to write.
 */
export function registerSetMyLanguageRoute(
  app: Hono<{ Variables: SignedInVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'PUT', path: '/api/me/language', access: { kind: 'signed-in-only' } });

  app.put('/api/me/language', requireSignedIn(db, keys), async (c) => {
    const sessionState = c.get('sessionState');
    if (sessionState.status === 'not-active') {
      throw new NotFoundError('person.not-linked');
    }
    const personId =
      sessionState.status === 'active' ? sessionState.context.personId : sessionState.personId;
    const { language } = bodySchema.parse(await c.req.json());
    await updatePersonLanguage(db, personId, language);
    return c.body(null, 204);
  });
}
