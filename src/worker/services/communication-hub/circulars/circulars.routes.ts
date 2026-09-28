import { pageAsked } from '../../../core/pagination';
import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import { queueHubAlert } from '../alerts/queue-hub-alert';
import type { NotificationsQueue } from '../alerts/hub-alert-events';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { circularSchema } from './circulars.schema';
import {
  circularBranches,
  openCircular,
  receivedCirculars,
  SEND,
  sendCircular,
  sentCirculars,
} from './circulars.service';

const UNIT = '/api/communication-hub/units/:unitId';

function declareCircularsRoutes(): void {
  const send = { kind: 'capability', capability: SEND } as const;
  const officer = { kind: 'signed-in-only' } as const;
  registerRoute({ method: 'POST', path: `${UNIT}/circulars`, access: send });
  registerRoute({ method: 'GET', path: `${UNIT}/circular-branches`, access: send });
  registerRoute({ method: 'GET', path: `${UNIT}/circulars`, access: officer });
  registerRoute({ method: 'GET', path: `${UNIT}/circulars/:circularId`, access: officer });
  registerRoute({ method: 'GET', path: `${UNIT}/sent-circulars`, access: officer });
}

/**
 * Brief 20 A3, A4 and D-157: sending circulars (a capability), and — for
 * every officer of the unit, checked in the service — reading those
 * received, opening one, and the General Council's sent circulars with
 * their read confirmation. HTTP only.
 */
export function registerCircularsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  declareCircularsRoutes();
  const active = requireActiveAccess(db, keys);
  app.post(`${UNIT}/circulars`, active, async (c) => {
    const input = circularSchema.parse(await c.req.json());
    const sent = await sendCircular(db, c.get('requestContext'), c.req.param('unitId'), input);
    await queueHubAlert(queue, { kind: 'circular', circularId: sent.id });
    return c.json(sent, 201);
  });
  app.get(`${UNIT}/circular-branches`, active, async (c) =>
    c.json(await circularBranches(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${UNIT}/circulars`, active, async (c) =>
    c.json(
      await receivedCirculars(
        db,
        c.get('requestContext'),
        c.req.param('unitId'),
        pageAsked(c.req.query('page')),
      ),
    ),
  );
  app.get(`${UNIT}/circulars/:circularId`, active, async (c) =>
    c.json(
      await openCircular(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        circularId: c.req.param('circularId'),
      }),
    ),
  );
  app.get(`${UNIT}/sent-circulars`, active, async (c) =>
    c.json(
      await sentCirculars(
        db,
        c.get('requestContext'),
        c.req.param('unitId'),
        pageAsked(c.req.query('page')),
      ),
    ),
  );
}
