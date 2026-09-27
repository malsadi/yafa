import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { commentSchema, outcomeSchema } from './minutes.schema';
import { saveComment, saveOutcome } from './minutes.service';

const ITEM = '/api/meeting-recorder/units/:unitId/meetings/:meetingId/agenda/:itemId';

/**
 * Brief 22 B1, B2 and D-205 to D-207: the minutes — comments and the vote
 * or decision — written by the chair, secretary or a manager (checked in
 * the service). HTTP only.
 */
export function registerMinutesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const chairOrManager = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'PUT', path: `${ITEM}/comments/:personId`, access: chairOrManager });
  registerRoute({ method: 'PUT', path: `${ITEM}/outcome`, access: chairOrManager });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    meetingId: c.req.param('meetingId'),
    itemId: c.req.param('itemId'),
  });
  app.put(`${ITEM}/comments/:personId`, active, async (c) => {
    const input = commentSchema.parse(await c.req.json());
    await saveComment(db, c.get('requestContext'), {
      ...ref(c),
      personId: c.req.param('personId'),
      ...input,
    });
    return c.body(null, 204);
  });
  app.put(`${ITEM}/outcome`, active, async (c) => {
    const input = outcomeSchema.parse(await c.req.json());
    await saveOutcome(db, c.get('requestContext'), { ...ref(c), ...input });
    return c.body(null, 204);
  });
}
