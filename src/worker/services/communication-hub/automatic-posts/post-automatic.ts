import type { AutomaticKind } from '../../../../shared/communication-hub/notice-records';
import { generateId } from '../../../core/ids';

/** What an automatic post is about: the event or meeting, its title and its date. */
export interface AutomaticPostPayload {
  sourceRecordId: string;
  title: string;
  date: string;
}

/**
 * Brief 20 A1, build notes and 10.1: an automatic Noticeboard post — event
 * published, meeting scheduled, meeting has taken place — marked as
 * automatic and never changed. It returns the statement for the calling
 * service's own batch. Only the Event organiser and the Meeting recorder
 * call it (10.2, tested).
 */
export function postAutomatic(
  db: D1Database,
  unitId: string,
  kind: AutomaticKind,
  payload: AutomaticPostPayload & { actorPersonId: string },
): D1PreparedStatement {
  const at = new Date().toISOString();
  return db
    .prepare(
      `INSERT INTO notices (id, unit_id, source, automatic_kind, source_record_id, title, about_date,
         version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, 'automatic', ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      unitId,
      kind,
      payload.sourceRecordId,
      payload.title,
      payload.date,
      payload.actorPersonId,
      at,
      payload.actorPersonId,
      at,
    );
}
