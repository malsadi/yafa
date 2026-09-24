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
import { createHandover, getHandover, listHandovers } from './handovers.service';

const UNIT = '/api/committee-register/units/:unitId/handovers';
const ONE = '/api/committee-register/handovers/:handoverId';
const READ = { kind: 'capability', capability: 'committee-register.register.read' } as const;
const MANAGE = { kind: 'capability', capability: 'committee-register.handovers.manage' } as const;
const TAKE_PART = {
  kind: 'capability',
  capability: 'committee-register.handovers.confirm',
} as const;

/** Brief 14 C2 and D-067: handovers and their checklists. HTTP only. */
export function registerHandoversRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: UNIT, access: READ });
  registerRoute({ method: 'POST', path: UNIT, access: MANAGE });
  registerRoute({ method: 'GET', path: ONE, access: TAKE_PART });
  registerRoute({ method: 'POST', path: `${ONE}/items`, access: MANAGE });
  registerRoute({ method: 'DELETE', path: `${ONE}/items/:itemId`, access: MANAGE });
  registerRoute({ method: 'POST', path: `${ONE}/items/:itemId/tick`, access: TAKE_PART });
  registerRoute({ method: 'POST', path: `${ONE}/confirm`, access: TAKE_PART });
  const active = requireActiveAccess(db, keys);

  app.get(UNIT, active, async (c) =>
    c.json(await listHandovers(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(UNIT, active, async (c) => {
    const input = createHandoverSchema.parse(await c.req.json());
    return c.json(
      await createHandover(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.get(ONE, active, async (c) =>
    c.json(await getHandover(db, c.get('requestContext'), c.req.param('handoverId'))),
  );
  app.post(`${ONE}/items`, active, async (c) => {
    const item = addHandoverItemSchema.parse(await c.req.json());
    return c.json(
      await addChecklistItem(db, c.get('requestContext'), c.req.param('handoverId'), item),
      201,
    );
  });
  app.delete(`${ONE}/items/:itemId`, active, async (c) => {
    const { handoverId, itemId } = c.req.param();
    return c.json(await removeChecklistItem(db, c.get('requestContext'), { handoverId, itemId }));
  });
  app.post(`${ONE}/items/:itemId/tick`, active, async (c) => {
    const { ticked } = tickHandoverItemSchema.parse(await c.req.json());
    const { handoverId, itemId } = c.req.param();
    return c.json(
      await tickChecklistItem(db, c.get('requestContext'), { handoverId, itemId, ticked }),
    );
  });
  app.post(`${ONE}/confirm`, active, async (c) =>
    c.json(await confirmHandover(db, c.get('requestContext'), c.req.param('handoverId'))),
  );
}
