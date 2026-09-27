import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { MANAGE, READ } from '../events/events.service';
import { budgetLineSchema } from '../templates/templates.schema';
import {
  addBudgetLine,
  changeBudgetLine,
  eventAccount,
  removeBudgetLine,
} from './event-account.service';

const ONE = '/api/event-organiser/units/:unitId/events/:eventId';
const LINES = `${ONE}/budget-lines`;
const LINE = `${LINES}/:lineId`;

/** Brief 21 A2, D-176, D-177 and D-187: the event's account, and its budget lines while in Draft. HTTP only. */
export function registerEventAccountRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({
    method: 'GET',
    path: `${ONE}/account`,
    access: { kind: 'capability', capability: READ },
  });
  registerRoute({ method: 'POST', path: LINES, access: manage });
  registerRoute({ method: 'PUT', path: LINE, access: manage });
  registerRoute({ method: 'POST', path: `${LINE}/remove`, access: manage });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    eventId: c.req.param('eventId'),
  });
  app.get(`${ONE}/account`, active, async (c) =>
    c.json(await eventAccount(db, c.get('requestContext'), ref(c))),
  );
  app.post(LINES, active, async (c) => {
    const line = budgetLineSchema.parse(await c.req.json());
    await addBudgetLine(db, c.get('requestContext'), { ...ref(c), line });
    return c.body(null, 204);
  });
  app.put(LINE, active, async (c) => {
    const line = budgetLineSchema.parse(await c.req.json());
    await changeBudgetLine(db, c.get('requestContext'), {
      ...ref(c),
      lineId: c.req.param('lineId'),
      line,
    });
    return c.body(null, 204);
  });
  app.post(`${LINE}/remove`, active, async (c) => {
    await removeBudgetLine(db, c.get('requestContext'), {
      ...ref(c),
      lineId: c.req.param('lineId'),
    });
    return c.body(null, 204);
  });
}
