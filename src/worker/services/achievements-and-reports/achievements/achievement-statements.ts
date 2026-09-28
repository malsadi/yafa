import type { AchievementInput } from './achievements.schema';

interface Who {
  actor: string;
  at: string;
}

/** Brief 24 A1: a new achievement, at version 1. */
export function buildInsertAchievementStatement(
  db: D1Database,
  p: AchievementInput & Who & { id: string; unitId: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO achievements (id, unit_id, title, achievement_date, category_item_id, description,
         withdrawn_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      p.id,
      p.unitId,
      p.title,
      p.date,
      p.categoryItemId,
      p.description,
      p.actor,
      p.at,
      p.actor,
      p.at,
    );
}

/** O-152: its details changed, from the version read (9.1). */
export function buildUpdateAchievementStatement(
  db: D1Database,
  p: AchievementInput & Who & { id: string; version: number },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE achievements SET title = ?, achievement_date = ?, category_item_id = ?, description = ?,
         version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(p.title, p.date, p.categoryItemId, p.description, p.version + 1, p.actor, p.at, p.id);
}

/** O-151: the officers credited, set afresh — taken off and added in the same batch. */
export function buildOfficerStatements(
  db: D1Database,
  achievementId: string,
  personIds: readonly string[],
): D1PreparedStatement[] {
  return [
    db.prepare('DELETE FROM achievement_officers WHERE achievement_id = ?').bind(achievementId),
    ...[...new Set(personIds)].map((personId) =>
      db
        .prepare('INSERT INTO achievement_officers (achievement_id, person_id) VALUES (?, ?)')
        .bind(achievementId, personId),
    ),
  ];
}

/** O-152: withdrawn from the timeline (kept), or brought back. */
export function buildSetWithdrawnStatement(
  db: D1Database,
  p: Who & { id: string; version: number; withdraw: boolean },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE achievements SET withdrawn_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(p.withdraw ? p.at : null, p.version + 1, p.actor, p.at, p.id);
}
