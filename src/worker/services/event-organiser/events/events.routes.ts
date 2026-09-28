import { pageAsked } from '../../../core/pagination';
import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { CREATE } from '../templates/templates.service';
import { eventSaveSchema, newEventSchema } from './events.schema';
import {
  changeEventDetails,
  createEvent,
  MANAGE,
  oneEvent,
  READ,
  unitEvents,
} from './events.service';

const EVENTS = '/api/event-organiser/units/:unitId/events';
const ONE = `${EVENTS}/:eventId`;

/** Brief 21 A1 and D-172 to D-176: events — listed, created and changed. HTTP only. */
export function registerEventsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  registerRoute({ method: 'GET', path: EVENTS, access: read });
  registerRoute({ method: 'GET', path: ONE, access: read });
  registerRoute({
    method: 'POST',
    path: EVENTS,
    access: { kind: 'capability', capability: CREATE },
  });
  registerRoute({ method: 'PUT', path: ONE, access: { kind: 'capability', capability: MANAGE } });
  const active = requireActiveAccess(db, keys);
  app.get(EVENTS, active, async (c) =>
    c.json(
      await unitEvents(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        page: pageAsked(c.req.query('page')),
      }),
    ),
  );
  app.get(ONE, active, async (c) =>
    c.json(
      await oneEvent(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        eventId: c.req.param('eventId'),
      }),
    ),
  );
  app.post(EVENTS, active, async (c) => {
    const input = newEventSchema.parse(await c.req.json());
    return c.json(
      await createEvent(db, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const save = eventSaveSchema.parse(await c.req.json());
    await changeEventDetails(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      eventId: c.req.param('eventId'),
      ...save,
    });
    return c.body(null, 204);
  });
}
