import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import type { NotificationsQueue } from '../../communication-hub';
import { MANAGE } from '../meetings/meetings.service';
import { sendLater } from './send-later.service';

const SEND = '/api/meeting-recorder/units/:unitId/meetings/:meetingId/send-later';
const sendSchema = z.object({ target: z.enum(['calendar', 'meeting-scheduled', 'meeting-held']) });

/** D-209: a Calendar entry or hub message skipped while its service was off, sent once. HTTP only. */
export function registerSendLaterRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  registerRoute({ method: 'POST', path: SEND, access: { kind: 'capability', capability: MANAGE } });
  app.post(SEND, requireActiveAccess(db, keys), async (c) => {
    const { target } = sendSchema.parse(await c.req.json());
    await sendLater(db, queue, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      meetingId: c.req.param('meetingId'),
      target,
    });
    return c.body(null, 204);
  });
}
