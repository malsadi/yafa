import type { MeetingSummary } from '../../../../shared/meeting-recorder/meeting-records';
import type { MeetingInput } from './meetings.schema';

const SELECT = `SELECT m.id, m.unit_id AS unitId, m.type_item_id AS typeItemId, t.name_en AS typeNameEn,
    t.name_ar AS typeNameAr, m.date, m.start_time AS startTime, m.place, m.online_link AS onlineLink,
    m.chair_person_id AS chairPersonId, c.name AS chairName, m.secretary_person_id AS secretaryPersonId,
    s.name AS secretaryName, m.status, m.cancel_reason AS cancelReason,
    m.calendar_written_at AS calendarWrittenAt, m.scheduled_posted_at AS scheduledPostedAt,
    m.held_posted_at AS heldPostedAt, m.logged_at AS loggedAt, m.version
  FROM meetings m JOIN list_items t ON t.id = m.type_item_id
  LEFT JOIN people c ON c.id = m.chair_person_id LEFT JOIN people s ON s.id = m.secretary_person_id`;

/** D-199: one unit's meetings, soonest first. */
export async function listUnitMeetings(db: D1Database, unitId: string): Promise<MeetingSummary[]> {
  const { results } = await db
    .prepare(`${SELECT} WHERE m.unit_id = ? ORDER BY m.date, m.start_time, m.id`)
    .bind(unitId)
    .all<MeetingSummary>();
  return results;
}

export async function findMeeting(db: D1Database, id: string): Promise<MeetingSummary | null> {
  return db.prepare(`${SELECT} WHERE m.id = ?`).bind(id).first<MeetingSummary>();
}

export function buildInsertMeetingStatement(
  db: D1Database,
  row: MeetingInput & { id: string; unitId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO meetings (id, unit_id, type_item_id, date, start_time, place, online_link, chair_person_id,
         secretary_person_id, status, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.typeItemId,
      row.date,
      row.startTime,
      row.place,
      row.onlineLink,
      row.chairPersonId,
      row.secretaryPersonId,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** D-202: the details changed from `version`, while Scheduled; the database refuses anything else. */
export function buildUpdateMeetingStatement(
  db: D1Database,
  row: MeetingInput & { id: string; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE meetings SET type_item_id = ?, date = ?, start_time = ?, place = ?, online_link = ?,
         chair_person_id = ?, secretary_person_id = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      row.typeItemId,
      row.date,
      row.startTime,
      row.place,
      row.onlineLink,
      row.chairPersonId,
      row.secretaryPersonId,
      row.version + 1,
      row.actor,
      row.at,
      row.id,
    );
}

/** A meeting type's English name, which the Calendar and the hub message show (D-198). */
export async function findTypeName(db: D1Database, typeItemId: string): Promise<string> {
  const row = await db
    .prepare('SELECT name_en AS name FROM list_items WHERE id = ?')
    .bind(typeItemId)
    .first<{ name: string }>();
  return row?.name ?? '';
}
