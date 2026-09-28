import { pageAsked } from '../../../core/pagination';
import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import { queueHubAlert, queueReplyAlert } from '../alerts/queue-hub-alert';
import type { NotificationsQueue } from '../alerts/hub-alert-events';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { messageSchema } from '../conversations/hub-messages.schema';
import { discussionSchema } from './discussions.schema';
import {
  discussionInvitees,
  discussionMessages,
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
 * capability); reading and writing are for its members, checked in the
 * service. HTTP only.
 */
export function registerDiscussionsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  const start = { kind: 'capability', capability: START } as const;
  const member = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${UNIT}/discussions`, access: start });
  registerRoute({ method: 'GET', path: `${UNIT}/discussion-invitees`, access: start });
  registerRoute({ method: 'GET', path: MINE, access: member });
  registerRoute({ method: 'GET', path: `${ONE}/messages`, access: member });
  registerRoute({ method: 'POST', path: `${ONE}/messages`, access: member });
  const active = requireActiveAccess(db, keys);
  app.post(`${UNIT}/discussions`, active, async (c) => {
    const input = discussionSchema.parse(await c.req.json());
    const ctx = c.get('requestContext');
    const started = await startDiscussion(db, ctx, c.req.param('unitId'), input);
    await queueHubAlert(queue, {
      kind: 'discussion',
      discussionId: started.id,
      authorPersonId: ctx.personId,
    });
    return c.json(started, 201);
  });
  app.get(`${UNIT}/discussion-invitees`, active, async (c) =>
    c.json(await discussionInvitees(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(MINE, active, async (c) =>
    c.json(await myDiscussions(db, c.get('requestContext'), pageAsked(c.req.query('page')))),
  );
  app.get(`${ONE}/messages`, active, async (c) =>
    c.json(await discussionMessages(db, c.get('requestContext'), c.req.param('discussionId'))),
  );
  app.post(`${ONE}/messages`, active, async (c) => {
    const { body } = messageSchema.parse(await c.req.json());
    const ctx = c.get('requestContext');
    const discussionId = c.req.param('discussionId');
    await postDiscussionMessage(db, ctx, { discussionId, body });
    await queueReplyAlert(queue, {
      conversation: 'discussion',
      conversationId: discussionId,
      authorPersonId: ctx.personId,
    });
    return c.body(null, 201);
  });
}
