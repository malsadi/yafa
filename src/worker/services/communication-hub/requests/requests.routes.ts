import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { messageSchema } from '../conversations/hub-messages.schema';
import { requestSchema } from './requests.schema';
import {
  closeRequest,
  replyToRequest,
  requestUnits,
  requestReplies,
  SEND_REQUESTS,
  sendRequest,
  unitRequests,
} from './requests.service';

const UNIT = '/api/communication-hub/units/:unitId';
const ONE = `${UNIT}/requests/:requestId`;

/**
 * Brief 20 B3, P13 and D-160: sending and closing a branch's requests (a
 * capability); reading and replying are for every officer of a branch the
 * request involves, checked in the service. HTTP only.
 */
export function registerRequestsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const send = { kind: 'capability', capability: SEND_REQUESTS } as const;
  const party = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${UNIT}/requests`, access: send });
  registerRoute({ method: 'GET', path: `${UNIT}/request-units`, access: send });
  registerRoute({ method: 'POST', path: `${ONE}/close`, access: send });
  registerRoute({ method: 'GET', path: `${UNIT}/requests`, access: party });
  registerRoute({ method: 'GET', path: `${ONE}/replies`, access: party });
  registerRoute({ method: 'POST', path: `${ONE}/replies`, access: party });
  const active = requireActiveAccess(db, keys);
  const ids = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    requestId: c.req.param('requestId'),
  });
  app.post(`${UNIT}/requests`, active, async (c) => {
    const input = requestSchema.parse(await c.req.json());
    return c.json(
      await sendRequest(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.get(`${UNIT}/request-units`, active, async (c) =>
    c.json(await requestUnits(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.post(`${ONE}/close`, active, async (c) => {
    await closeRequest(db, c.get('requestContext'), ids(c));
    return c.body(null, 204);
  });
  app.get(`${UNIT}/requests`, active, async (c) =>
    c.json(await unitRequests(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${ONE}/replies`, active, async (c) =>
    c.json(await requestReplies(db, c.get('requestContext'), ids(c))),
  );
  app.post(`${ONE}/replies`, active, async (c) => {
    const { body } = messageSchema.parse(await c.req.json());
    await replyToRequest(db, c.get('requestContext'), { ...ids(c), body });
    return c.body(null, 201);
  });
}
