import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { versionSchema } from '../events/events.schema';
import { APPROVE, approveEvent } from './approval.service';

const ONE = '/api/event-organiser/units/:unitId/events/:eventId';

/** Brief 21 A4 and D-175: the committee's approval, by a second officer. HTTP only. */
export function registerApprovalRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({
    method: 'POST',
    path: `${ONE}/approve`,
    access: { kind: 'capability', capability: APPROVE },
  });
  app.post(`${ONE}/approve`, requireActiveAccess(db, keys), async (c) => {
    const { version } = versionSchema.parse(await c.req.json());
    await approveEvent(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      eventId: c.req.param('eventId'),
      version,
    });
    return c.body(null, 204);
  });
}
