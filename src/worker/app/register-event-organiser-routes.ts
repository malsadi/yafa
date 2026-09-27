import type { Hono } from 'hono';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import type { NotificationsQueue } from '../services/communication-hub';
import {
  registerApprovalRoutes,
  registerChoicesRoutes,
  registerEventAccountRoutes,
  registerEventsRoutes,
  registerEventTasksRoutes,
  registerPublishingRoutes,
  registerStatusRoutes,
  registerTemplatesRoutes,
} from '../services/event-organiser';

/** Service 1's routes (brief 21), each declaring its capability (7.4). */
export function registerEventOrganiserRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  registerTemplatesRoutes(app, db, keys);
  registerChoicesRoutes(app, db, keys);
  registerEventsRoutes(app, db, keys);
  registerApprovalRoutes(app, db, keys);
  registerStatusRoutes(app, db, keys, queue);
  registerEventTasksRoutes(app, db, keys);
  registerEventAccountRoutes(app, db, keys);
  registerPublishingRoutes(app, db, keys, queue);
}
