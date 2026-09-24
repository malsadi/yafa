import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { appointSystemAdministratorSchema } from './system-administrators.schema';
import {
  appointAdministrator,
  listAdministrators,
  removeAdministrator,
} from './system-administrators.service';

const PATH = '/api/administration-panel/system-administrators';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.system-administrators.manage',
} as const;

/** Brief 25 A1: list, appoint and remove system administrators. HTTP only. */
export function registerSystemAdministratorsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: PATH, access: ACCESS });
  registerRoute({ method: 'DELETE', path: `${PATH}/:personId`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) => c.json(await listAdministrators(db, c.get('requestContext'))));

  app.post(PATH, active, async (c) => {
    const { personId } = appointSystemAdministratorSchema.parse(await c.req.json());
    await appointAdministrator(db, c.get('requestContext'), personId);
    return c.body(null, 201);
  });

  app.delete(`${PATH}/:personId`, active, async (c) => {
    await removeAdministrator(db, c.get('requestContext'), c.req.param('personId'));
    return c.body(null, 204);
  });
}
