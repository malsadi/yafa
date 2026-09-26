import { z } from 'zod';
import { CALENDAR_KINDS } from '../../../../shared/calendar/calendar-records';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** A comma-separated list in the query, as its items. */
const commaList = z.string().transform((text) => text.split(',').filter(Boolean));

/**
 * Brief 19 B1 to B3: a period, the unit's own calendar or all branches, and
 * which kinds and branches to show (empty means all).
 */
export const calendarQuerySchema = z
  .object({
    from: date,
    to: date,
    scope: z.enum(['branch', 'all']),
    kinds: commaList.pipe(z.array(z.enum(CALENDAR_KINDS))).optional(),
    units: commaList.pipe(z.array(z.string().min(1))).optional(),
  })
  .refine((q) => q.from <= q.to, { message: 'From is not after to.' });

export type CalendarQuery = z.infer<typeof calendarQuerySchema>;
