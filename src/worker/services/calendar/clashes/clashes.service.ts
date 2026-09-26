import type { ClashNotice } from '../../../../shared/calendar/calendar-records';

/**
 * Brief 19 B4, build notes and D-149: the unit's other meetings and events
 * on a day — for the Event organiser and Meeting recorder as a date is
 * chosen. It returns notices, never errors: nothing is blocked. The record
 * being dated is left out, so it never clashes with itself.
 */
export async function checkClashes(
  db: D1Database,
  unitId: string,
  date: string,
  except?: { kind: 'meeting' | 'event'; sourceRecordId: string },
): Promise<ClashNotice[]> {
  const { results } = await db
    .prepare(
      `SELECT kind, title, start_time AS startTime FROM calendar_entries
       WHERE unit_id = ? AND date = ? AND NOT (kind = ? AND source_record_id = ?)
       ORDER BY start_time, title`,
    )
    .bind(unitId, date, except?.kind ?? '', except?.sourceRecordId ?? '')
    .all<ClashNotice>();
  return results;
}
