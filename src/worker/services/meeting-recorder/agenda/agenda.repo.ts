import { generateId } from '../../../core/ids';
import type { AgendaItemInput } from './agenda.schema';

export interface AgendaItemRow {
  id: string;
  meetingId: string;
  position: number;
  raisedInMeeting: number;
  version: number;
}

export async function findAgendaItem(
  db: D1Database,
  itemId: string,
): Promise<AgendaItemRow | null> {
  return db
    .prepare(
      'SELECT id, meeting_id AS meetingId, position, raised_in_meeting AS raisedInMeeting, version FROM agenda_items WHERE id = ?',
    )
    .bind(itemId)
    .first<AgendaItemRow>();
}

/** A new item, last on the agenda; one raised in the meeting is marked so (D-204). */
export function buildAddItemStatement(
  db: D1Database,
  row: AgendaItemInput & { meetingId: string; raised: boolean; actor: string; at: string },
): { id: string; statement: D1PreparedStatement } {
  const id = generateId();
  return {
    id,
    statement: db
      .prepare(
        `INSERT INTO agenda_items (id, meeting_id, position, title, note, raised_in_meeting, version, updated_by, updated_at)
         SELECT ?, ?, COALESCE(MAX(position), 0) + 1, ?, ?, ?, 1, ?, ? FROM agenda_items WHERE meeting_id = ?`,
      )
      .bind(
        id,
        row.meetingId,
        row.title,
        row.note,
        row.raised ? 1 : 0,
        row.actor,
        row.at,
        row.meetingId,
      ),
  };
}

export function buildChangeItemStatement(
  db: D1Database,
  row: AgendaItemInput & { id: string; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE agenda_items SET title = ?, note = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(row.title, row.note, row.version + 1, row.actor, row.at, row.id);
}

/** D-204: the agenda put in a new order — each item's place written, its version raised. */
export function buildOrderStatements(
  db: D1Database,
  row: { itemIds: string[]; actor: string; at: string },
): D1PreparedStatement[] {
  return row.itemIds.map((id, index) =>
    db
      .prepare(
        'UPDATE agenda_items SET position = ?, version = version + 1, updated_by = ?, updated_at = ? WHERE id = ?',
      )
      .bind(index + 1, row.actor, row.at, id),
  );
}
