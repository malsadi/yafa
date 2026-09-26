import type { CommunityDateInput } from './community-dates.schema';

export interface CommunityDateRow {
  id: string;
  unitId: string;
  retiredAt: string | null;
}

export async function findCommunityDate(
  db: D1Database,
  id: string,
): Promise<CommunityDateRow | null> {
  return db
    .prepare(
      'SELECT id, unit_id AS unitId, retired_at AS retiredAt FROM community_dates WHERE id = ?',
    )
    .bind(id)
    .first<CommunityDateRow>();
}

export function buildInsertCommunityDateStatement(
  db: D1Database,
  row: CommunityDateInput & { id: string; unitId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO community_dates (id, unit_id, title, start_date, end_date, start_time, description,
         for_all_branches, retired_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.title,
      row.startDate,
      row.endDate,
      row.startTime,
      row.description,
      row.forAllBranches ? 1 : 0,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change from `version` (9.1): new details, or retired or brought back (D-147). */
export function buildUpdateCommunityDateStatement(
  db: D1Database,
  change: { id: string; version: number; actor: string; at: string } & (
    { date: CommunityDateInput } | { retiredAt: string | null }
  ),
): D1PreparedStatement {
  const next = [change.version + 1, change.actor, change.at, change.id];
  if ('retiredAt' in change) {
    return db
      .prepare(
        'UPDATE community_dates SET retired_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
      )
      .bind(change.retiredAt, ...next);
  }
  const d = change.date;
  return db
    .prepare(
      `UPDATE community_dates SET title = ?, start_date = ?, end_date = ?, start_time = ?, description = ?,
         for_all_branches = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      d.title,
      d.startDate,
      d.endDate,
      d.startTime,
      d.description,
      d.forAllBranches ? 1 : 0,
      ...next,
    );
}
