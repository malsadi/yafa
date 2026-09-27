import type { ClashNotice } from '../../../../shared/calendar/calendar-records';

/**
 * Brief 19 B4, build notes, D-149 and D-151: the unit's other meetings and
 * events on a day — or, given a last day, on every day from the first to
 * the last — for the Event organiser and Meeting recorder as a date is
 * chosen. It returns notices, each with its day, never errors: nothing is
 * blocked. The record being dated is left out, so it never clashes with
 * itself. D-189: an event over several days clashes on each day it covers;
 * its notice names the first of the chosen days it falls on.
 */
export async function checkClashes(
  db: D1Database,
  unitId: string,
  date: string,
  options: {
    lastDate?: string;
    except?: { kind: 'meeting' | 'event'; sourceRecordId: string };
  } = {},
): Promise<ClashNotice[]> {
  const { except } = options;
  const { results } = await db
    .prepare(
      `SELECT kind, title, MAX(date, ?1) AS date, start_time AS startTime FROM calendar_entries
       WHERE unit_id = ?3 AND date <= ?2 AND COALESCE(last_date, date) >= ?1
         AND NOT (kind = ?4 AND source_record_id = ?5)
       ORDER BY 3, start_time, title`,
    )
    .bind(date, options.lastDate ?? date, unitId, except?.kind ?? '', except?.sourceRecordId ?? '')
    .all<ClashNotice>();
  return results;
}
