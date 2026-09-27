import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { READ } from '../events/events.service';
import { eventChoices, eventClashes } from './choices.service';

const UNIT = '/api/event-organiser/units/:unitId';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const clashQuery = z.object({
  firstDay: date,
  lastDay: date.optional(),
  eventId: z.string().min(1).optional(),
});

/** D-172 and 19 B4: the types and lead officers to choose from, and date clash notices. HTTP only. */
export function registerChoicesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/event-choices`, access: read });
  registerRoute({ method: 'GET', path: `${UNIT}/event-clashes`, access: read });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/event-choices`, active, async (c) =>
    c.json(await eventChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${UNIT}/event-clashes`, active, async (c) => {
    const query = clashQuery.parse(c.req.query());
    return c.json(
      await eventClashes(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        firstDay: query.firstDay,
        lastDay: query.lastDay ?? null,
        eventId: query.eventId ?? null,
      }),
    );
  });
}
