import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { leaveDiscussion, removeMember } from './discussion-departures.service';

const ONE = '/api/communication-hub/discussions/:discussionId';

/** D-168: the starter removes a member, and a member leaves — checked in the service. HTTP only. */
export function registerDiscussionDeparturesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const member = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${ONE}/members/:personId/remove`, access: member });
  registerRoute({ method: 'POST', path: `${ONE}/leave`, access: member });
  const active = requireActiveAccess(db, keys);
  app.post(`${ONE}/members/:personId/remove`, active, async (c) => {
    await removeMember(db, c.get('requestContext'), {
      discussionId: c.req.param('discussionId'),
      personId: c.req.param('personId'),
    });
    return c.body(null, 204);
  });
  app.post(`${ONE}/leave`, active, async (c) => {
    await leaveDiscussion(db, c.get('requestContext'), c.req.param('discussionId'));
    return c.body(null, 204);
  });
}
