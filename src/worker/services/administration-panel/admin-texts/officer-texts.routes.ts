import type { Hono } from 'hono';
import { NotFoundError } from '../../../core/errors';
import { registerRoute } from '../../../core/permissions';
import {
  requireSignedIn,
  type ClerkVerificationKeys,
  type SignedInVariables,
} from '../../../middleware';
import { readOfficerText } from './officer-texts.service';

const ACCESS_NOT_ACTIVE = '/api/texts/access-not-active';
const HELP = '/api/texts/help';

/**
 * Brief 25 C5 and 8.5: the administrator's texts officers read, in both
 * languages. "Access not active" is for anyone signed in, since it is shown
 * exactly when their access isn't active (6.2); the help text is for active
 * officers, on the Help page (D-083). 404 until the text is written (rule 5).
 */
export function registerOfficerTextsRoutes(
  app: Hono<{ Variables: SignedInVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: ACCESS_NOT_ACTIVE, access: { kind: 'signed-in-only' } });
  registerRoute({ method: 'GET', path: HELP, access: { kind: 'signed-in-only' } });
  const signedIn = requireSignedIn(db, keys);

  app.get(ACCESS_NOT_ACTIVE, signedIn, async (c) => {
    return c.json(await readOfficerText(db, 'access-not-active'));
  });
  app.get(HELP, signedIn, async (c) => {
    if (c.get('sessionState').status !== 'active') throw new NotFoundError('texts.not-found');
    return c.json(await readOfficerText(db, 'help'));
  });
}
