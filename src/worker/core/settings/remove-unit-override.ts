import { buildAuditStatement } from '../audit';
import { generateId } from '../ids';

/**
 * Removes a unit's override, so the national value applies again (brief
 * 8.1). Recorded like any change: the history row keeps the old value, and
 * its new value is JSON null, meaning "no override". One D1 batch.
 */
export async function removeUnitOverride(
  db: D1Database,
  params: { key: string; unitId: string; actorPersonId: string },
): Promise<void> {
  const { key, unitId } = params;
  await db.batch([
    db
      .prepare(
        `INSERT INTO settings_history (id, key, scope, previous_value, new_value, changed_at, changed_by)
         VALUES (?, ?, ?, (SELECT value FROM settings WHERE key = ? AND scope = ?), 'null', ?, ?)`,
      )
      .bind(generateId(), key, unitId, key, unitId, new Date().toISOString(), params.actorPersonId),
    db.prepare('DELETE FROM settings WHERE key = ? AND scope = ?').bind(key, unitId),
    buildAuditStatement(db, {
      actorPersonId: params.actorPersonId,
      action: 'settings.override-removed',
      entityType: 'setting',
      entityId: `${key}:${unitId}`,
    }),
  ]);
}
