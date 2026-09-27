import type { Hono } from 'hono';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import type { NotificationsQueue } from '../../communication-hub';
import { meetingChoices } from './meeting-choices.service';
import { meetingSaveSchema, newMeetingSchema } from './meetings.schema';
import {
  changeMeetingDetails,
  MANAGE,
  oneMeeting,
  READ,
  scheduleMeeting,
  unitMeetings,
} from './meetings.service';

const UNIT = '/api/meeting-recorder/units/:unitId';
const MEETINGS = `${UNIT}/meetings`;
const ONE = `${MEETINGS}/:meetingId`;

/** Brief 22 A1 and D-198 to D-202: meetings — listed, scheduled and changed. HTTP only. */
export function registerMeetingsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
  queue: NotificationsQueue,
): void {
  const read = { kind: 'capability', capability: READ } as const;
  const manage = { kind: 'capability', capability: MANAGE } as const;
  registerRoute({ method: 'GET', path: `${UNIT}/meeting-choices`, access: read });
  registerRoute({ method: 'GET', path: MEETINGS, access: read });
  registerRoute({ method: 'GET', path: ONE, access: read });
  registerRoute({ method: 'POST', path: MEETINGS, access: manage });
  registerRoute({ method: 'PUT', path: ONE, access: manage });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/meeting-choices`, active, async (c) =>
    c.json(await meetingChoices(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(MEETINGS, active, async (c) =>
    c.json(await unitMeetings(db, c.get('requestContext'), c.req.param('unitId'))),
  );
  app.get(ONE, active, async (c) =>
    c.json(
      await oneMeeting(db, c.get('requestContext'), {
        unitId: c.req.param('unitId'),
        meetingId: c.req.param('meetingId'),
      }),
    ),
  );
  app.post(MEETINGS, active, async (c) => {
    const input = newMeetingSchema.parse(await c.req.json());
    return c.json(
      await scheduleMeeting(db, queue, c.get('requestContext'), c.req.param('unitId'), input),
      201,
    );
  });
  app.put(ONE, active, async (c) => {
    const save = meetingSaveSchema.parse(await c.req.json());
    await changeMeetingDetails(db, c.get('requestContext'), {
      unitId: c.req.param('unitId'),
      meetingId: c.req.param('meetingId'),
      ...save,
    });
    return c.body(null, 204);
  });
}
