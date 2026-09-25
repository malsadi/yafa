import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { createBranchRole, listBranchRoles, renameBranchRole } from './branch-roles.service';
import { getBranchRolesAllowed, setBranchRolesAllowed } from './branch-roles-allowed.service';
import {
  branchRolesAllowedSchema,
  createRoleSchema,
  orderRolesSchema,
  renameRoleSchema,
} from './roles.schema';
import { orderStandardRoles } from './standard-roles-order.service';
import { createStandardRole, listStandardRoles, renameStandardRole } from './roles.service';

const STANDARD = '/api/committee-register/roles';
const BRANCH = '/api/committee-register/branches/:unitId/roles';
const ALLOWED = '/api/committee-register/branch-roles-allowed';
const STANDARD_ACCESS = {
  kind: 'capability',
  capability: 'committee-register.standard-roles.manage',
} as const;
const BRANCH_ACCESS = {
  kind: 'capability',
  capability: 'committee-register.branch-roles.manage',
} as const;

type App = Hono<{ Variables: ActiveAccessVariables }>;
type Handler = ReturnType<typeof requireActiveAccess>;

const ctx = (c: { get: (key: 'requestContext') => ActiveAccessVariables['requestContext'] }) =>
  c.get('requestContext');

function mountStandardRoutes(app: App, db: D1Database, active: Handler): void {
  app.get(STANDARD, active, async (c) => c.json(await listStandardRoles(db, ctx(c))));
  app.post(STANDARD, active, async (c) =>
    c.json(await createStandardRole(db, ctx(c), createRoleSchema.parse(await c.req.json())), 201),
  );
  app.patch(`${STANDARD}/:roleId`, active, async (c) => {
    const changes = renameRoleSchema.parse(await c.req.json());
    return c.json(await renameStandardRole(db, ctx(c), c.req.param('roleId'), changes));
  });
  app.put(`${STANDARD}/order`, active, async (c) => {
    const { roleIds } = orderRolesSchema.parse(await c.req.json());
    await orderStandardRoles(db, ctx(c), roleIds);
    return c.body(null, 204);
  });
  app.get(ALLOWED, active, async (c) => c.json(await getBranchRolesAllowed(db, ctx(c))));
  app.put(ALLOWED, active, async (c) => {
    const { allowed } = branchRolesAllowedSchema.parse(await c.req.json());
    return c.json(await setBranchRolesAllowed(db, ctx(c), allowed));
  });
}

function mountBranchRoutes(app: App, db: D1Database, active: Handler): void {
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

/** Brief 14 B2 and 25 B2: standard roles, their order, and branches' own roles. HTTP only. */
export function registerRolesRoutes(app: App, db: D1Database, keys: ClerkVerificationKeys): void {
  const routes = [
    ['GET', STANDARD, STANDARD_ACCESS],
    ['POST', STANDARD, STANDARD_ACCESS],
    ['PATCH', `${STANDARD}/:roleId`, STANDARD_ACCESS],
    ['PUT', `${STANDARD}/order`, STANDARD_ACCESS],
    ['GET', ALLOWED, STANDARD_ACCESS],
    ['PUT', ALLOWED, STANDARD_ACCESS],
    ['GET', BRANCH, BRANCH_ACCESS],
    ['POST', BRANCH, BRANCH_ACCESS],
    ['PATCH', `${BRANCH}/:roleId`, BRANCH_ACCESS],
  ] as const;
  for (const [method, path, access] of routes) registerRoute({ method, path, access });
  const active = requireActiveAccess(db, keys);
  mountStandardRoutes(app, db, active);
  mountBranchRoutes(app, db, active);
}
