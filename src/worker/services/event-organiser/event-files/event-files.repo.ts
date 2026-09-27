import type { EventFileRecord } from '../../../../shared/event-organiser/event-file-uses';

/** Brief 21 F1, F2: an event's files, by section, newest first. */
export async function listEventFiles(db: D1Database, eventId: string): Promise<EventFileRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT f.id AS fileId, x.section, f.file_name AS fileName, f.content_type AS contentType, f.size,
         p.name AS addedByName, x.added_at AS addedAt, x.retired_at AS retiredAt
       FROM event_files x JOIN files f ON f.id = x.file_id LEFT JOIN people p ON p.id = x.added_by
       WHERE x.event_id = ? ORDER BY x.section, x.added_at DESC`,
    )
    .bind(eventId)
    .all<EventFileRecord>();
  return results;
}

export function buildInsertEventFileStatement(
  db: D1Database,
  row: {
    fileId: string;
    eventId: string;
    unitId: string;
    section: string;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO event_files (file_id, event_id, unit_id, section, added_by, added_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(row.fileId, row.eventId, row.unitId, row.section, row.actor, row.at);
}

/** D-196: before close, an event file retired (hidden, kept) or brought back; never deleted. */
export function buildSetEventFileRetiredStatement(
  db: D1Database,
  row: { fileId: string; retire: boolean; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare('UPDATE event_files SET retired_at = ?, retired_by = ? WHERE file_id = ?')
    .bind(row.retire ? row.at : null, row.retire ? row.actor : null, row.fileId);
}

/** Whether this file is one of the event's, and where its object is. */
export async function findEventFile(
  db: D1Database,
  params: { eventId: string; fileId: string },
): Promise<{ key: string; retiredAt: string | null } | null> {
  return db
    .prepare(
      'SELECT f.key, x.retired_at AS retiredAt FROM event_files x JOIN files f ON f.id = x.file_id WHERE x.event_id = ? AND x.file_id = ?',
    )
    .bind(params.eventId, params.fileId)
    .first<{ key: string; retiredAt: string | null }>();
}
