import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { checkAccess, listPeopleForAccessCheck } from './access-check.service';

const PATH = '/api/administration-panel/access-check';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.access-check.read',
} as const;

/** Brief 25 A4: the access check. HTTP only. */
export function registerAccessCheckRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: `${PATH}/people`, access: ACCESS });
  registerRoute({ method: 'GET', path: `${PATH}/people/:personId`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(`${PATH}/people`, active, async (c) =>
    c.json(await listPeopleForAccessCheck(db, c.get('requestContext'))),
  );
  app.get(`${PATH}/people/:personId`, active, async (c) =>
    c.json(await checkAccess(db, c.get('requestContext'), c.req.param('personId'))),
  );
}
