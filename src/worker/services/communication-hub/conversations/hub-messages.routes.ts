import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { removeMessage } from './hub-messages.service';

/** D-161: an author removes their own message; the service checks it is theirs. HTTP only. */
export function registerHubMessagesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const path = '/api/communication-hub/messages/:messageId/remove';
  registerRoute({ method: 'POST', path, access: { kind: 'signed-in-only' } });
  app.post(path, requireActiveAccess(db, keys), async (c) => {
    await removeMessage(db, c.get('requestContext'), c.req.param('messageId'));
    return c.body(null, 204);
  });
}
