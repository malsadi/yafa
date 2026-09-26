import { generateId } from '../../../core/ids';

/** Brief 19 A1, A2: what the Calendar shows of a meeting or event — written by its owning service. */
export interface CalendarEntryInput {
  unitId: string;
  kind: 'meeting' | 'event';
  sourceRecordId: string;
  title: string;
  /** `YYYY-MM-DD`, London (9.1). */
  date: string;
  /** `HH:MM`, or null when it has no set time. */
  startTime: string | null;
}

/**
 * Brief 19 build notes and 10.1: the meeting's or event's entry, added or
 * brought up to date — a statement for the owning service's own batch (the
 * Meeting recorder when a meeting is scheduled, the Event organiser when an
 * event is published). It is the only writer.
 */
export function buildCalendarEntryStatement(
  db: D1Database,
  entry: CalendarEntryInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO calendar_entries (id, unit_id, kind, source_record_id, title, date, start_time, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(kind, source_record_id) DO UPDATE SET
         unit_id = excluded.unit_id, title = excluded.title, date = excluded.date,
         start_time = excluded.start_time, updated_at = excluded.updated_at`,
    )
    .bind(
      generateId(),
      entry.unitId,
      entry.kind,
      entry.sourceRecordId,
      entry.title,
      entry.date,
      entry.startTime,
      new Date().toISOString(),
    );
}

/** The owning service's statement taking its record's entry off the Calendar, when it no longer belongs there. */
export function buildRemoveCalendarEntryStatement(
  db: D1Database,
  params: { kind: 'meeting' | 'event'; sourceRecordId: string },
): D1PreparedStatement {
  return db
    .prepare('DELETE FROM calendar_entries WHERE kind = ? AND source_record_id = ?')
    .bind(params.kind, params.sourceRecordId);
}
