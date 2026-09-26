import type { ClashNotice } from '../../../../shared/calendar/calendar-records';

/**
 * Brief 19 B4, build notes, D-149 and D-151: the unit's other meetings and
 * events on a day — or, given a last day, on every day from the first to
 * the last — for the Event organiser and Meeting recorder as a date is
 * chosen. It returns notices, each with its day, never errors: nothing is
 * blocked. The record being dated is left out, so it never clashes with
 * itself.
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
      `SELECT kind, title, date, start_time AS startTime FROM calendar_entries
       WHERE unit_id = ? AND date BETWEEN ? AND ? AND NOT (kind = ? AND source_record_id = ?)
       ORDER BY date, start_time, title`,
    )
    .bind(unitId, date, options.lastDate ?? date, except?.kind ?? '', except?.sourceRecordId ?? '')
    .all<ClashNotice>();
  return results;
}
