import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import {
  addChecklistItem,
  confirmHandover,
  removeChecklistItem,
  tickChecklistItem,
} from './handover-checklist.service';
import {
  addHandoverItemSchema,
  createHandoverSchema,
  tickHandoverItemSchema,
} from './handovers.schema';
import { createHandover, getHandover, listHandovers, listMyHandovers } from './handovers.service';

const UNIT = '/api/committee-register/units/:unitId/handovers';
const ONE = '/api/committee-register/handovers/:handoverId';
const MINE = '/api/committee-register/my-handovers';
const READ = { kind: 'capability', capability: 'committee-register.register.read' } as const;
const MANAGE = { kind: 'capability', capability: 'committee-register.handovers.manage' } as const;
const TAKE_PART = {
  kind: 'capability',
  capability: 'committee-register.handovers.confirm',
} as const;

type App = Hono<{ Variables: ActiveAccessVariables }>;
type Handler = ReturnType<typeof requireActiveAccess>;

const ctx = (c: { get: (key: 'requestContext') => ActiveAccessVariables['requestContext'] }) =>
  c.get('requestContext');

function mountHandoverRoutes(app: App, db: D1Database, active: Handler): void {
  app.get(MINE, active, async (c) => c.json(await listMyHandovers(db, ctx(c))));
  app.get(UNIT, active, async (c) =>
    c.json(await listHandovers(db, ctx(c), c.req.param('unitId'))),
  );
  app.post(UNIT, active, async (c) => {
    const input = createHandoverSchema.parse(await c.req.json());
    return c.json(await createHandover(db, ctx(c), c.req.param('unitId'), input), 201);
  });
  app.get(ONE, active, async (c) =>
    c.json(await getHandover(db, ctx(c), c.req.param('handoverId'))),
  );
}

function mountChecklistRoutes(app: App, db: D1Database, active: Handler): void {
  app.post(`${ONE}/items`, active, async (c) => {
    const item = addHandoverItemSchema.parse(await c.req.json());
    return c.json(await addChecklistItem(db, ctx(c), c.req.param('handoverId'), item), 201);
  });
  app.delete(`${ONE}/items/:itemId`, active, async (c) => {
    const { handoverId, itemId } = c.req.param();
    return c.json(await removeChecklistItem(db, ctx(c), { handoverId, itemId }));
  });
  app.post(`${ONE}/items/:itemId/tick`, active, async (c) => {
    const { ticked } = tickHandoverItemSchema.parse(await c.req.json());
    const { handoverId, itemId } = c.req.param();
    return c.json(await tickChecklistItem(db, ctx(c), { handoverId, itemId, ticked }));
  });
  app.post(`${ONE}/confirm`, active, async (c) =>
    c.json(await confirmHandover(db, ctx(c), c.req.param('handoverId'))),
  );
}

/** Brief 14 C2 and D-067: handovers and their checklists. HTTP only. */
export function registerHandoversRoutes(
  app: App,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const routes = [
    ['GET', MINE, TAKE_PART],
    ['GET', UNIT, READ],
    ['POST', UNIT, MANAGE],
    ['GET', ONE, TAKE_PART],
    ['POST', `${ONE}/items`, MANAGE],
    ['DELETE', `${ONE}/items/:itemId`, MANAGE],
    ['POST', `${ONE}/items/:itemId/tick`, TAKE_PART],
    ['POST', `${ONE}/confirm`, TAKE_PART],
  ] as const;
  for (const [method, path, access] of routes) registerRoute({ method, path, access });
  const active = requireActiveAccess(db, keys);
  mountHandoverRoutes(app, db, active);
  mountChecklistRoutes(app, db, active);
}
