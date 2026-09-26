import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { messageSchema } from '../conversations/hub-messages.schema';
import { discussionSchema, inviteSchema } from './discussions.schema';
import {
  discussionInvitees,
  discussionMessages,
  inviteToDiscussion,
  myDiscussions,
  postDiscussionMessage,
  START,
  startDiscussion,
} from './discussions.service';

const UNIT = '/api/communication-hub/units/:unitId';
const MINE = '/api/communication-hub/discussions';
const ONE = `${MINE}/:discussionId`;

/**
 * Brief 20 B2 and D-159: starting a discussion and choosing invitees (a
 * capability); reading, writing and inviting are for its members and
 * starter, checked in the service. HTTP only.
 */
export function registerDiscussionsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const start = { kind: 'capability', capability: START } as const;
  const member = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${UNIT}/discussions`, access: start });
  registerRoute({ method: 'GET', path: `${UNIT}/discussion-invitees`, access: start });
  registerRoute({ method: 'GET', path: MINE, access: member });
  registerRoute({ method: 'GET', path: `${ONE}/messages`, access: member });
  registerRoute({ method: 'POST', path: `${ONE}/messages`, access: member });
  registerRoute({ method: 'POST', path: `${ONE}/members`, access: member });
  const active = requireActiveAccess(db, keys);
  app.post(`${UNIT}/discussions`, active, async (c) => {
    const input = discussionSchema.parse(await c.req.json());
    return c.json(
      await startDiscussion(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.get(`${UNIT}/discussion-invitees`, active, async (c) =>
    c.json(await discussionInvitees(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(MINE, active, async (c) => c.json(await myDiscussions(db, c.get('requestContext'))));
  app.get(`${ONE}/messages`, active, async (c) =>
    c.json(await discussionMessages(db, c.get('requestContext'), c.req.param('discussionId'))),
  );
  app.post(`${ONE}/messages`, active, async (c) => {
    const { body } = messageSchema.parse(await c.req.json());
    await postDiscussionMessage(db, c.get('requestContext'), {
      discussionId: c.req.param('discussionId'),
      body,
    });
    return c.body(null, 201);
  });
  app.post(`${ONE}/members`, active, async (c) => {
    const { personIds } = inviteSchema.parse(await c.req.json());
    await inviteToDiscussion(db, c.get('requestContext'), {
      discussionId: c.req.param('discussionId'),
      personIds,
    });
    return c.body(null, 204);
  });
}
