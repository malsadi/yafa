import { buildAuditStatement } from '../audit';
import { generateId } from '../ids';

export interface WriteSettingValueParams {
  key: string;
  scope: string;
  valueJson: string;
  actorPersonId: string;
}

/**
 * Writes a setting's new value, its history row and an audit entry in one
 * D1 batch (brief section 8.1). The history row's previous value is looked
 * up in SQL (a scalar subquery), never read-then-written in TypeScript
 * (brief section 9.1) — it comes back null for a key's first-ever value.
 */
export async function writeSettingValue(
  db: D1Database,
  params: WriteSettingValueParams,
): Promise<void> {
  const now = new Date().toISOString();

  const historyStatement = db
    .prepare(
      `INSERT INTO settings_history (id, key, scope, previous_value, new_value, changed_at, changed_by)
       VALUES (?, ?, ?, (SELECT value FROM settings WHERE key = ? AND scope = ?), ?, ?, ?)`,
    )
    .bind(
      generateId(),
      params.key,
      params.scope,
      params.key,
      params.scope,
      params.valueJson,
      now,
      params.actorPersonId,
    );

  const upsertStatement = db
    .prepare(
      `INSERT INTO settings (key, scope, value, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (key, scope) DO UPDATE SET
         value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .bind(params.key, params.scope, params.valueJson, now, params.actorPersonId);

  const auditStatement = buildAuditStatement(db, {
    actorPersonId: params.actorPersonId,
    action: 'settings.set',
    entityType: 'setting',
    entityId: `${params.key}:${params.scope}`,
    after: JSON.parse(params.valueJson) as unknown,
  });

  await db.batch([historyStatement, upsertStatement, auditStatement]);
}
