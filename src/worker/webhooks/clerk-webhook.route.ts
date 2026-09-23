import type { Hono } from 'hono';
import { verifyWebhook } from '@clerk/backend/webhooks';
import { UnauthorizedError } from '../core/errors';
import { registerRoute } from '../core/permissions';
import { handleClerkUserEvent } from './handle-clerk-user-event';

/**
 * D-004's "signed-webhook" class: authenticated purely by the Standard
 * Webhooks signature (`verifyWebhook`, Svix-compatible headers — brief
 * section 6.2: "webhooks are verified by signature (Svix); anything
 * unsigned is rejected"), never a Clerk session. `verifyWebhook` throws on
 * a bad/missing signature or a missing secret; caught and re-thrown as
 * `UnauthorizedError` for a clear, specific code rather than a generic
 * `server.error` (401 fits "not accepted as authentic" the same way it
 * fits a missing session token).
 */
export function registerClerkWebhookRoute(app: Hono, db: D1Database, signingSecret: string): void {
  registerRoute({
    method: 'POST',
    path: '/api/webhooks/clerk',
    access: { kind: 'signed-webhook' },
  });

  app.post('/api/webhooks/clerk', async (c) => {
    let event;
    try {
      event = await verifyWebhook(c.req.raw, { signingSecret });
    } catch {
      throw new UnauthorizedError('webhook.invalid-signature');
    }

    if (
      event.type === 'user.created' ||
      event.type === 'user.updated' ||
      event.type === 'user.deleted'
    ) {
      await handleClerkUserEvent(db, event);
    }
    return c.body(null, 200);
  });
}
