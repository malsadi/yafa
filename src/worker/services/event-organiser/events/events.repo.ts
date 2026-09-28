import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import type { EventInput } from './events.schema';

const SELECT = `SELECT e.id, e.unit_id AS unitId, e.name, e.type_item_id AS typeItemId,
    t.name_en AS typeNameEn, t.name_ar AS typeNameAr, e.lead_person_id AS leadPersonId,
    p.name AS leadName, e.first_day AS firstDay, e.start_time AS startTime, e.last_day AS lastDay,
    e.status, e.created_by AS createdBy, e.approved_by AS approvedBy, e.approved_at AS approvedAt,
    e.cancel_reason AS cancelReason, e.cancelled_at AS cancelledAt,
    e.calendar_published_at AS calendarPublishedAt,
    e.noticeboard_published_at AS noticeboardPublishedAt,
    e.cancellation_posted_at AS cancellationPostedAt, e.closed_at AS closedAt, e.version
  FROM events e JOIN list_items t ON t.id = e.type_item_id LEFT JOIN people p ON p.id = e.lead_person_id`;

/** D-173: one unit's events, soonest first. */
/** Brief 21 and D-217: the unit's events, by first day — as a query, to page. */
export const unitEventsQuery = (unitId: string) => ({
  sql: `${SELECT} WHERE e.unit_id = ? ORDER BY e.first_day, e.name, e.id`,
  binds: [unitId],
});

export async function findEvent(db: D1Database, id: string): Promise<EventSummary | null> {
  return db.prepare(`${SELECT} WHERE e.id = ?`).bind(id).first<EventSummary>();
}

export function buildInsertEventStatement(
  db: D1Database,
  row: EventInput & {
    id: string;
    unitId: string;
    templateId: string | null;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO events (id, unit_id, name, type_item_id, lead_person_id, first_day, start_time, last_day,
         status, template_id, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.name,
      row.typeItemId,
      row.leadPersonId,
      row.firstDay,
      row.startTime,
      row.lastDay,
      row.templateId,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change of details from `version`; the trigger refuses a stale one (9.1) or a closed event. */
export function buildUpdateEventDetailsStatement(
  db: D1Database,
  row: EventInput & { id: string; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE events SET name = ?, type_item_id = ?, lead_person_id = ?, first_day = ?, start_time = ?,
         last_day = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      row.name,
      row.typeItemId,
      row.leadPersonId,
      row.firstDay,
      row.startTime,
      row.lastDay,
      row.version + 1,
      row.actor,
      row.at,
      row.id,
    );
}
