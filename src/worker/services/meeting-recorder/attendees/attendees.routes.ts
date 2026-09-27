import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { MANAGE } from '../meetings/meetings.service';
import { addAttendeesSchema, attendanceSchema } from './attendees.schema';
import { addAttendees, markAttendance, removeAttendee } from './attendees.service';

const ATTENDEES = '/api/meeting-recorder/units/:unitId/meetings/:meetingId/attendees';
const ONE = `${ATTENDEES}/:personId`;

/**
 * Brief 22 A2 and D-203: attendees chosen by those who manage meetings;
 * attendance marked by the chair, secretary or a manager (checked in the
 * service). HTTP only.
 */
export function registerAttendeesRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'POST', path: ATTENDEES, access: manage });
  registerRoute({ method: 'POST', path: `${ONE}/remove`, access: manage });
  registerRoute({ method: 'PUT', path: `${ONE}/attendance`, access: { kind: 'signed-in-only' } });
  const active = requireActiveAccess(db, keys);
  const ref = (c: { req: { param: (name: string) => string } }) => ({
    unitId: c.req.param('unitId'),
    meetingId: c.req.param('meetingId'),
  });
  app.post(ATTENDEES, active, async (c) => {
    const { personIds } = addAttendeesSchema.parse(await c.req.json());
    await addAttendees(db, c.get('requestContext'), { ...ref(c), personIds });
    return c.body(null, 204);
  });
  app.post(`${ONE}/remove`, active, async (c) => {
    await removeAttendee(db, c.get('requestContext'), {
      ...ref(c),
      personId: c.req.param('personId'),
    });
    return c.body(null, 204);
  });
  app.put(`${ONE}/attendance`, active, async (c) => {
    const { attendance } = attendanceSchema.parse(await c.req.json());
    await markAttendance(db, c.get('requestContext'), {
      ...ref(c),
      personId: c.req.param('personId'),
      attendance,
    });
    return c.body(null, 204);
  });
}
