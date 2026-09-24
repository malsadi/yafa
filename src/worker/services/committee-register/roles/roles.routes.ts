import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { createBranchRole, listBranchRoles, renameBranchRole } from './branch-roles.service';
import { createRoleSchema, renameRoleSchema } from './roles.schema';
import { createStandardRole, listStandardRoles, renameStandardRole } from './roles.service';

const STANDARD = '/api/committee-register/roles';
const BRANCH = '/api/committee-register/branches/:unitId/roles';
const STANDARD_ACCESS = {
  kind: 'capability',
  capability: 'committee-register.standard-roles.manage',
} as const;
const BRANCH_ACCESS = {
  kind: 'capability',
  capability: 'committee-register.branch-roles.manage',
} as const;

/** Brief 14 B2 and 25 B2: standard roles and branches' own roles. HTTP only. */
export function registerRolesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: STANDARD, access: STANDARD_ACCESS });
  registerRoute({ method: 'POST', path: STANDARD, access: STANDARD_ACCESS });
  registerRoute({ method: 'PATCH', path: `${STANDARD}/:roleId`, access: STANDARD_ACCESS });
  registerRoute({ method: 'GET', path: BRANCH, access: BRANCH_ACCESS });
  registerRoute({ method: 'POST', path: BRANCH, access: BRANCH_ACCESS });
  registerRoute({ method: 'PATCH', path: `${BRANCH}/:roleId`, access: BRANCH_ACCESS });
  const active = requireActiveAccess(db, keys);
  const ctx = (c: { get: (key: 'requestContext') => ActiveAccessVariables['requestContext'] }) =>
    c.get('requestContext');

  app.get(STANDARD, active, async (c) => c.json(await listStandardRoles(db, ctx(c))));
  app.post(STANDARD, active, async (c) =>
    c.json(await createStandardRole(db, ctx(c), createRoleSchema.parse(await c.req.json())), 201),
  );
  app.patch(`${STANDARD}/:roleId`, active, async (c) => {
    const changes = renameRoleSchema.parse(await c.req.json());
    return c.json(await renameStandardRole(db, ctx(c), c.req.param('roleId'), changes));
  });

  app.get(BRANCH, active, async (c) =>
    c.json(await listBranchRoles(db, ctx(c), c.req.param('unitId'))),
  );
  app.post(BRANCH, active, async (c) => {
    const input = createRoleSchema.parse(await c.req.json());
    return c.json(await createBranchRole(db, ctx(c), c.req.param('unitId'), input), 201);
  });
  app.patch(`${BRANCH}/:roleId`, active, async (c) => {
    const changes = renameRoleSchema.parse(await c.req.json());
    const { unitId, roleId } = c.req.param();
    return c.json(await renameBranchRole(db, ctx(c), { unitId, roleId, changes }));
  });
}
