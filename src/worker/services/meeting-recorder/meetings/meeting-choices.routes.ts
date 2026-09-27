import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { meetingChoices, meetingClashes } from './meeting-choices.service';
import { READ } from './meetings.service';

const UNIT = '/api/meeting-recorder/units/:unitId';
const clashQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meetingId: z.string().min(1).optional(),
});

/** D-198, D-207 and 19 B4: what a meeting's form chooses from, and date clash notices. HTTP only. */
export function registerMeetingChoicesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/meeting-choices`, access: read });
  registerRoute({ method: 'GET', path: `${UNIT}/meeting-clashes`, access: read });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/meeting-choices`, active, async (c) =>
    c.json(await meetingChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(`${UNIT}/meeting-clashes`, active, async (c) => {
    const query = clashQuery.parse(c.req.query());
    return c.json(
      await meetingClashes(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        date: query.date,
        meetingId: query.meetingId ?? null,
      }),
    );
  });
}
