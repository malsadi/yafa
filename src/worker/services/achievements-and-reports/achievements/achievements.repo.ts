import type { AchievementRecord } from '../../../../shared/achievements-and-reports/achievement-records';

type Row = Omit<AchievementRecord, 'officers' | 'photos' | 'locked'> & { locked: number };
interface OfficerRow {
  achievementId: string;
  personId: string;
  name: string | null;
}
interface PhotoRow {
  achievementId: string;
  fileId: string;
  fileName: string;
}

const LOCKED = `EXISTS (SELECT 1 FROM annual_reports r WHERE r.unit_id = a.unit_id AND r.status = 'Finalised'
  AND a.achievement_date BETWEEN r.period_start AND r.period_end)`;
const SELECT = `SELECT a.id, a.unit_id AS unitId, u.name_en AS unitNameEn, u.name_ar AS unitNameAr,
  a.title, a.achievement_date AS date, a.category_item_id AS categoryItemId,
  c.name_en AS categoryNameEn, c.name_ar AS categoryNameAr, a.description,
  a.withdrawn_at AS withdrawnAt, a.version, ${LOCKED} AS locked
  FROM achievements a JOIN units u ON u.id = a.unit_id LEFT JOIN list_items c ON c.id = a.category_item_id`;

/** Each achievement's officers and live photos, joined on in two queries. */
async function withCredits(db: D1Database, rows: Row[]): Promise<AchievementRecord[]> {
  if (rows.length === 0) return [];
  const marks = rows.map(() => '?').join(', ');
  const ids = rows.map((r) => r.id);
  const [officers, photos] = await db.batch([
    db
      .prepare(
        `SELECT o.achievement_id AS achievementId, o.person_id AS personId, p.name
         FROM achievement_officers o LEFT JOIN people p ON p.id = o.person_id
         WHERE o.achievement_id IN (${marks}) ORDER BY p.name`,
      )
      .bind(...ids),
    db
      .prepare(
        `SELECT ph.achievement_id AS achievementId, ph.file_id AS fileId, f.file_name AS fileName
         FROM achievement_photos ph JOIN files f ON f.id = ph.file_id
         WHERE ph.achievement_id IN (${marks}) AND ph.retired_at IS NULL ORDER BY ph.added_at`,
      )
      .bind(...ids),
  ]);
  const officerRows = (officers?.results ?? []) as OfficerRow[];
  const photoRows = (photos?.results ?? []) as PhotoRow[];
  return rows.map((r) => ({
    ...r,
    locked: r.locked === 1,
    officers: officerRows
      .filter((o) => o.achievementId === r.id)
      .map((o) => ({ personId: o.personId, name: o.name })),
    photos: photoRows
      .filter((p) => p.achievementId === r.id)
      .map((p) => ({ fileId: p.fileId, fileName: p.fileName })),
  }));
}

/** Brief 24 A2, A3: these units' achievements, in date order (latest first), withdrawn ones included. */
export async function listAchievementsOf(
  db: D1Database,
  unitIds: readonly string[],
): Promise<AchievementRecord[]> {
  if (unitIds.length === 0) return [];
  const result = await db
    .prepare(
      `${SELECT} WHERE a.unit_id IN (${unitIds.map(() => '?').join(', ')})
       ORDER BY a.achievement_date DESC, a.created_at DESC`,
    )
    .bind(...unitIds)
    .all<Row>();
  return withCredits(db, result.results);
}

/** One of the unit's achievements, or null — another unit's is never found. */
export async function findAchievement(
  db: D1Database,
  unitId: string,
  achievementId: string,
): Promise<AchievementRecord | null> {
  const row = await db
    .prepare(`${SELECT} WHERE a.unit_id = ? AND a.id = ?`)
    .bind(unitId, achievementId)
    .first<Row>();
  return row ? ((await withCredits(db, [row]))[0] ?? null) : null;
}

/** Brief 24 B1: the achievements credited to a person in these units, latest first. */
export async function listAchievementsCreditedTo(
  db: D1Database,
  personId: string,
  unitIds: readonly string[],
): Promise<AchievementRecord[]> {
  if (unitIds.length === 0) return [];
  const result = await db
    .prepare(
      `${SELECT} JOIN achievement_officers o ON o.achievement_id = a.id
       WHERE o.person_id = ? AND a.withdrawn_at IS NULL
         AND a.unit_id IN (${unitIds.map(() => '?').join(', ')})
       ORDER BY a.achievement_date DESC`,
    )
    .bind(personId, ...unitIds)
    .all<Row>();
  return withCredits(db, result.results);
}
