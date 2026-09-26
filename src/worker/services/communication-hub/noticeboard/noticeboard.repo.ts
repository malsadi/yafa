export interface NoticeRow {
  id: string;
  unitId: string;
  source: 'officer' | 'automatic';
  retiredAt: string | null;
}

export async function findNotice(db: D1Database, id: string): Promise<NoticeRow | null> {
  return db
    .prepare(
      'SELECT id, unit_id AS unitId, source, retired_at AS retiredAt FROM notices WHERE id = ?',
    )
    .bind(id)
    .first<NoticeRow>();
}

export function buildInsertNoticeStatement(
  db: D1Database,
  row: { id: string; unitId: string; title: string; body: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO notices (id, unit_id, source, title, body, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, 'officer', ?, ?, 1, ?, ?, ?, ?)`,
    )
    .bind(row.id, row.unitId, row.title, row.body, row.actor, row.at, row.actor, row.at);
}

/** A change from `version` (9.1): new title and text, or retired or brought back (D-155). */
export function buildUpdateNoticeStatement(
  db: D1Database,
  change: { id: string; version: number; actor: string; at: string } & (
    { title: string; body: string } | { retiredAt: string | null }
  ),
): D1PreparedStatement {
  const next = [change.version + 1, change.actor, change.at, change.id];
  if ('retiredAt' in change) {
    return db
      .prepare(
        'UPDATE notices SET retired_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
      )
      .bind(change.retiredAt, ...next);
  }
  return db
    .prepare(
      'UPDATE notices SET title = ?, body = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(change.title, change.body, ...next);
}

/** Whether anyone has voted on the notice's vote (D-155). */
export async function voteHasBallots(db: D1Database, noticeId: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 AS found FROM notice_ballots WHERE notice_id = ? LIMIT 1')
    .bind(noticeId)
    .first<{ found: number }>();
  return row !== null;
}

/** Whether the notice has a vote at all. */
export async function noticeHasVote(db: D1Database, noticeId: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 AS found FROM notice_votes WHERE notice_id = ?')
    .bind(noticeId)
    .first<{ found: number }>();
  return row !== null;
}
