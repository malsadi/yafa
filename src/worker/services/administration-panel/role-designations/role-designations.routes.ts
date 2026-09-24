import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { setDesignationSchema } from './role-designations.schema';
import { getRoleDesignations, setRoleDesignation } from './role-designations.service';

const PATH = '/api/administration-panel/role-designations';
const ACCESS = {
  kind: 'capability',
  capability: 'administration-panel.role-designations.manage',
} as const;

/** Brief 25 B2: read and set the register officer designations. HTTP only. */
export function registerRoleDesignationsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'PUT', path: PATH, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) =>
    c.json(await getRoleDesignations(db, c.get('requestContext'))),
  );

  app.put(PATH, active, async (c) => {
    const input = setDesignationSchema.parse(await c.req.json());
    await setRoleDesignation(db, c.get('requestContext'), input);
    return c.body(null, 204);
  });
}
