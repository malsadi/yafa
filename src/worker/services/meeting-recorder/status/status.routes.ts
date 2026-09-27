import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { versionSchema } from '../meetings/meetings.schema';
import { MANAGE } from '../meetings/meetings.service';
import { cancelMeeting, holdMeeting } from './status.service';

const ONE = '/api/meeting-recorder/units/:unitId/meetings/:meetingId';
const cancelSchema = z.object({
  reason: z.string().trim().min(1),
  version: z.number().int().positive(),
});

/**
 * D-201 and D-202: marking a meeting held — for its chair or secretary (no
 * capability) or a manager, checked in the service — and cancelling it. HTTP only.
 */
export function registerStatusRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'POST', path: `${ONE}/hold`, access: { kind: 'signed-in-only' } });
  registerRoute({
    method: 'POST',
    path: `${ONE}/cancel`,
    access: { kind: 'capability', capability: MANAGE },
  });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    meetingId: c.req.param('meetingId'),
  });
  app.post(`${ONE}/hold`, active, async (c) => {
    const { version } = versionSchema.parse(await c.req.json());
    await holdMeeting(db, c.get('requestContext'), { ...ref(c), version });
    return c.body(null, 204);
  });
  app.post(`${ONE}/cancel`, active, async (c) => {
    const input = cancelSchema.parse(await c.req.json());
    await cancelMeeting(db, c.get('requestContext'), { ...ref(c), ...input });
    return c.body(null, 204);
  });
}
