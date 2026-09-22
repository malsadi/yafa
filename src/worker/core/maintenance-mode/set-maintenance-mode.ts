import { buildAuditStatement } from '../audit';
import { MAINTENANCE_MODE_KEY } from './maintenance-mode-key';

export interface SetMaintenanceModeParams {
  enabled: boolean;
  actorPersonId: string;
}

/**
 * Switches maintenance mode on or off, with an audit entry, in one D1
 * batch (T-054). This is the one write this module makes; whoever wires
 * the 15 D6 route must exempt it from `maintenanceModeGate` — otherwise,
 * once maintenance mode is on, nothing can ever switch it off again.
 */
export async function setMaintenanceMode(
  db: D1Database,
  params: SetMaintenanceModeParams,
): Promise<void> {
  const now = new Date().toISOString();

  const upsertStatement = db
    .prepare(
      `INSERT INTO maintenance_mode (key, enabled, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (key) DO UPDATE SET
         enabled = excluded.enabled, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    )
    .bind(MAINTENANCE_MODE_KEY, params.enabled ? 1 : 0, now, params.actorPersonId);

  const auditStatement = buildAuditStatement(db, {
    actorPersonId: params.actorPersonId,
    action: params.enabled ? 'maintenance-mode.enable' : 'maintenance-mode.disable',
    entityType: 'maintenance-mode',
    entityId: MAINTENANCE_MODE_KEY,
  });

  await db.batch([upsertStatement, auditStatement]);
}
