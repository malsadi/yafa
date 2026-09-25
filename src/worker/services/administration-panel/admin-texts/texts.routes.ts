import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { adminTextSchema } from './admin-texts.schema';
import { getTexts, publishPrivacyNotice, writeOfficerText } from './texts.service';

const PATH = '/api/administration-panel/texts';
const ACCESS = { kind: 'capability', capability: 'administration-panel.texts.manage' } as const;
const officerTextKey = z.enum(['access-not-active', 'help']);

/** Brief 25 C5: the privacy notice, the "access not active" message and the help text. HTTP only. */
export function registerTextsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: `${PATH}/privacy-notice`, access: ACCESS });
  registerRoute({ method: 'PUT', path: `${PATH}/:key`, access: ACCESS });
  const active = requireActiveAccess(db, keys);
  app.get(PATH, active, async (c) => c.json(await getTexts(db, c.get('requestContext'))));
  app.post(`${PATH}/privacy-notice`, active, async (c) => {
    const text = adminTextSchema.parse(await c.req.json());
    return c.json(await publishPrivacyNotice(db, c.get('requestContext'), text), 201);
  });
  app.put(`${PATH}/:key`, active, async (c) => {
    const key = officerTextKey.parse(c.req.param('key'));
    const text = adminTextSchema.parse(await c.req.json());
    return c.json(await writeOfficerText(db, c.get('requestContext'), { key, ...text }));
  });
}
