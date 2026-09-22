import { buildAuditStatement } from '../audit';

export interface WriteServiceSwitchValueParams {
  service: string;
  scope: string;
  enabled: boolean;
  actorPersonId: string;
}

/** Writes a service switch's new value and an audit entry in one D1 batch. */
export async function writeServiceSwitchValue(
  db: D1Database,
  params: WriteServiceSwitchValueParams,
): Promise<void> {
  const now = new Date().toISOString();

  const upsertStatement = db
    .prepare(
      `INSERT INTO service_switches (service, scope, enabled, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (service, scope) DO UPDATE SET
         enabled = excluded.enabled, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .bind(params.service, params.scope, params.enabled ? 1 : 0, now, params.actorPersonId);

  const auditStatement = buildAuditStatement(db, {
    actorPersonId: params.actorPersonId,
    action: params.enabled ? 'service-switches.enable' : 'service-switches.disable',
    entityType: 'service-switch',
    entityId: `${params.service}:${params.scope}`,
  });

  await db.batch([upsertStatement, auditStatement]);
}
