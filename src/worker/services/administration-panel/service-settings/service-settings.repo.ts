import type { SettingHistoryEntry } from '../../../../shared/administration-panel/service-settings';

const parse = (json: string | null): unknown =>
  json === null ? null : (JSON.parse(json) as unknown);

/** Every stored value, national and per unit, as JSON. */
export async function listStoredValues(
  db: D1Database,
): Promise<{ key: string; scope: string; value: string }[]> {
  const result = await db
    .prepare('SELECT key, scope, value FROM settings')
    .all<{ key: string; scope: string; value: string }>();
  return result.results;
}

/** One setting's changes, newest first, with the name of who made each. */
export async function listSettingHistory(
  db: D1Database,
  key: string,
): Promise<SettingHistoryEntry[]> {
  const result = await db
    .prepare(
      `SELECT h.id, h.scope, h.previous_value AS previousValue, h.new_value AS newValue,
              h.changed_at AS changedAt, COALESCE(p.name, '') AS changedByName
       FROM settings_history h LEFT JOIN people p ON p.id = h.changed_by
       WHERE h.key = ? ORDER BY h.changed_at DESC, h.rowid DESC`,
    )
    .bind(key)
    .all<{
      id: string;
      scope: string;
      previousValue: string | null;
      newValue: string;
      changedAt: string;
      changedByName: string;
    }>();
  return result.results.map((row) => ({
    ...row,
    previousValue: parse(row.previousValue),
    newValue: parse(row.newValue),
  }));
}

export async function findHistoryEntry(
  db: D1Database,
  key: string,
  historyId: string,
): Promise<{ scope: string; newValue: unknown } | null> {
  const row = await db
    .prepare('SELECT scope, new_value AS newValue FROM settings_history WHERE key = ? AND id = ?')
    .bind(key, historyId)
    .first<{ scope: string; newValue: string }>();
  return row ? { scope: row.scope, newValue: parse(row.newValue) } : null;
}
