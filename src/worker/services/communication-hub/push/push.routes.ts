import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { endpointSchema, subscriptionSchema } from './push.schema';
import { pushSetup, subscribeDevice, unsubscribeDevice } from './push.service';

const PUSH = '/api/communication-hub/push';

/** Brief 20 C1 and 9.5: an officer's own devices — nothing to grant (D-004). HTTP only. */
export function registerPushRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  publicKey: string | undefined,
): void {
  const own = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'GET', path: `${PUSH}/setup`, access: own });
  registerRoute({ method: 'POST', path: `${PUSH}/subscriptions`, access: own });
  registerRoute({ method: 'POST', path: `${PUSH}/subscriptions/remove`, access: own });
  const active = requireActiveAccess(db, keys);
  app.get(`${PUSH}/setup`, active, async (c) =>
    c.json(await pushSetup(db, c.get('requestContext'), publicKey)),
  );
  app.post(`${PUSH}/subscriptions`, active, async (c) => {
    await subscribeDevice(
      db,
      c.get('requestContext'),
      subscriptionSchema.parse(await c.req.json()),
    );
    return c.body(null, 204);
  });
  app.post(`${PUSH}/subscriptions/remove`, active, async (c) => {
    const { endpoint } = endpointSchema.parse(await c.req.json());
    await unsubscribeDevice(db, c.get('requestContext'), endpoint);
    return c.body(null, 204);
  });
}
