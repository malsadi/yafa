import type { Hono } from 'hono';
import { z } from 'zod';
import { registerRoute } from '../../../core/permissions';
import {
  requireActiveAccess,
  type ActiveAccessVariables,
  type ClerkVerificationKeys,
} from '../../../middleware';
import { requireCalendarCapability } from '../calendar-access';
import { checkClashes } from '../clashes/clashes.service';
import { calendarQuerySchema } from './views.schema';
import { calendarView } from './views.service';

const UNIT = '/api/calendar/units/:unitId';
const READ = { kind: 'capability', capability: 'calendar.calendar.read' } as const;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** D-151: a day, or a first and last day, every day of which is checked. */
const clashQuerySchema = z
  .object({ date: day, lastDate: day.optional() })
  .refine((q) => q.lastDate === undefined || q.lastDate >= q.date, {
    message: 'The last day is not before the first.',
  });

/** Brief 19 B1 to B4: the calendar for a period, and clash notices for a day. HTTP only; read-only (10.3). */
export function registerViewsRoutes(
  app: Hono<{ Variables: ActiveAccessVariables }>,
  db: D1Database,
  keys: ClerkVerificationKeys,
): void {
  registerRoute({ method: 'GET', path: `${UNIT}/items`, access: READ });
  registerRoute({ method: 'GET', path: `${UNIT}/clashes`, access: READ });
  const active = requireActiveAccess(db, keys);
  app.get(`${UNIT}/items`, active, async (c) => {
    const query = calendarQuerySchema.parse(c.req.query());
    return c.json(
      await calendarView(db, c.get('requestContext'), { ...query, unitId: c.req.param('unitId') }),
    );
  });
  app.get(`${UNIT}/clashes`, active, async (c) => {
    const { date, lastDate } = clashQuerySchema.parse(c.req.query());
    await requireCalendarCapability(
      db,
      c.get('requestContext'),
      'calendar.calendar.read',
      c.req.param('unitId'),
    );
    return c.json(await checkClashes(db, c.req.param('unitId'), date, { lastDate }));
  });
}
