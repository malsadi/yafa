import type { Hono } from 'hono';
import { z } from 'zod';
import {
  PUBLISH_TARGETS,
  type PublishTarget,
} from '../../../../shared/event-organiser/publish-targets';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import type { NotificationsQueue } from '../../communication-hub';
import { MANAGE } from '../events/events.service';
import { publishEvent } from './publishing.service';

const PUBLISH = '/api/event-organiser/units/:unitId/events/:eventId/publish';
const publishSchema = z.object({
  targets: z.array(z.enum(PUBLISH_TARGETS as [PublishTarget, ...PublishTarget[]])).min(1),
  version: z.number().int().positive(),
});

/** Brief 21 B4, D-182 and D-186: publishing to the Calendar and the Noticeboard, each once. HTTP only. */
export function registerPublishingRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  registerRoute({
    method: 'POST',
    path: PUBLISH,
    access: { kind: 'capability', capability: MANAGE },
  });
  app.post(PUBLISH, requireActiveAccess(db, keys), async (c) => {
    const input = publishSchema.parse(await c.req.json());
    return c.json(
      await publishEvent(db, queue, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        eventId: c.req.param('eventId'),
        ...input,
      }),
    );
  });
}
