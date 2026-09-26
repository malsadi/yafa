import type { Hono } from 'hono';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerAlertChoicesRoutes,
  registerCircularsRoutes,
  registerDiscussionMembersRoutes,
  registerDiscussionsRoutes,
  registerHubMessagesRoutes,
  registerNoticeboardRoutes,
  registerPushRoutes,
  registerNoticeVotesRoutes,
  registerRequestsRoutes,
  registerRoleNetworksRoutes,
  type NotificationsQueue,
} from '../services/communication-hub';

/** Service 4's routes (brief 20), each declaring its capability (7.4). */
export function registerCommunicationHubRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
  pushPublicKey: string | undefined,
): void {
  registerNoticeboardRoutes(app, db, keys, queue);
  registerNoticeVotesRoutes(app, db, keys);
  registerCircularsRoutes(app, db, keys, queue);
  registerRoleNetworksRoutes(app, db, keys, queue);
  registerDiscussionsRoutes(app, db, keys, queue);
  registerDiscussionMembersRoutes(app, db, keys);
  registerRequestsRoutes(app, db, keys, queue);
  registerHubMessagesRoutes(app, db, keys);
  registerAlertChoicesRoutes(app, db, keys);
  registerPushRoutes(app, db, keys, pushPublicKey);
}
