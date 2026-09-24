import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { createBranchSchema, updateUnitSchema } from './branches.schema';
import { createBranch, listAllUnits, updateUnit } from './branches.service';

const PATH = '/api/committee-register/branches';
const ACCESS = { kind: 'capability', capability: 'committee-register.branches.manage' } as const;

/** Brief 14 A1 and 25 B1: list, add and change units. HTTP only. */
export function registerBranchesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: PATH, access: ACCESS });
  registerRoute({ method: 'POST', path: PATH, access: ACCESS });
  registerRoute({ method: 'PATCH', path: `${PATH}/:unitId`, access: ACCESS });
  const active = requireActiveAccess(db, keys);

  app.get(PATH, active, async (c) => c.json(await listAllUnits(db, c.get('requestContext'))));

  app.post(PATH, active, async (c) => {
    const input = createBranchSchema.parse(await c.req.json());
    return c.json(await createBranch(db, c.get('requestContext'), input), 201);
  });

  app.patch(`${PATH}/:unitId`, active, async (c) => {
    const changes = updateUnitSchema.parse(await c.req.json());
    return c.json(await updateUnit(db, c.get('requestContext'), c.req.param('unitId'), changes));
  });
}
