import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import { queueReplyAlert } from '../alerts/queue-hub-alert';
import type { NotificationsQueue } from '../alerts/hub-alert-events';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { messageSchema } from '../conversations/hub-messages.schema';
import {
  myRoleNetworks,
  postRoleNetworkMessage,
  roleNetworkMessages,
} from './role-networks.service';

const NETWORKS = '/api/communication-hub/role-networks';
const MESSAGES = `${NETWORKS}/:roleId/messages`;

/** Brief 20 B1 and D-158: role networks — membership is holding the role now, checked in the service. HTTP only. */
export function registerRoleNetworksRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  const member = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'GET', path: NETWORKS, access: member });
  registerRoute({ method: 'GET', path: MESSAGES, access: member });
  registerRoute({ method: 'POST', path: MESSAGES, access: member });
  const active = requireActiveAccess(db, keys);
  app.get(NETWORKS, active, async (c) => c.json(await myRoleNetworks(db, c.get('requestContext'))));
  app.get(MESSAGES, active, async (c) =>
    c.json(await roleNetworkMessages(db, c.get('requestContext'), c.req.param('roleId'))),
  );
  app.post(MESSAGES, active, async (c) => {
    const { body } = messageSchema.parse(await c.req.json());
    const ctx = c.get('requestContext');
    const roleId = c.req.param('roleId');
    await postRoleNetworkMessage(db, ctx, { roleId, body });
    await queueReplyAlert(queue, {
      conversation: 'role-network',
      conversationId: roleId,
      authorPersonId: ctx.personId,
    });
    return c.body(null, 201);
  });
}
