import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { cancelSchema, statusMoveSchema } from './status.schema';
import { cancelEvent, moveEventStatus } from './status.service';

const ONE = '/api/event-organiser/units/:unitId/events/:eventId';

/**
 * Brief 21 status, D-174, D-180 and D-181: moving an event along, and
 * cancelling it. For its lead officer (no capability) or those who manage
 * events — checked in the service. HTTP only.
 */
export function registerStatusRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const leadOrManager = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${ONE}/status`, access: leadOrManager });
  registerRoute({ method: 'POST', path: `${ONE}/cancel`, access: leadOrManager });
  const active = requireActiveAccess(db, keys);
  app.post(`${ONE}/status`, active, async (c) => {
    const move = statusMoveSchema.parse(await c.req.json());
    await moveEventStatus(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      eventId: c.req.param('eventId'),
      ...move,
    });
    return c.body(null, 204);
  });
  app.post(`${ONE}/cancel`, active, async (c) => {
    const cancel = cancelSchema.parse(await c.req.json());
    await cancelEvent(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      eventId: c.req.param('eventId'),
      ...cancel,
    });
    return c.body(null, 204);
  });
}
