import type { Hono } from 'hono';
import type { ActiveAccessVariables, ClerkVerificationKeys } from '../middleware';
import {
  registerCircularsRoutes,
  registerDiscussionsRoutes,
  registerHubMessagesRoutes,
  registerNoticeboardRoutes,
  registerNoticeVotesRoutes,
  registerRequestsRoutes,
  registerRoleNetworksRoutes,
} from '../services/communication-hub';

/** Service 4's routes (brief 20), each declaring its capability (7.4). */
export function registerCommunicationHubRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerNoticeboardRoutes(app, db, keys);
  registerNoticeVotesRoutes(app, db, keys);
  registerCircularsRoutes(app, db, keys);
  registerRoleNetworksRoutes(app, db, keys);
  registerDiscussionsRoutes(app, db, keys);
  registerRequestsRoutes(app, db, keys);
  registerHubMessagesRoutes(app, db, keys);
}
