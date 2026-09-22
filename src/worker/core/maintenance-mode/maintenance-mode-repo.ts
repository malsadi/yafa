import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { maintenanceMode } from '../../../db/schema/core/maintenance-mode';
import { MAINTENANCE_MODE_KEY } from './maintenance-mode-key';

/** No row means off (T-054), the same default-off reasoning as `service_switches`. */
export async function readMaintenanceModeEnabled(db: D1Database): Promise<boolean> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ enabled: maintenanceMode.enabled })
    .from(maintenanceMode)
    .where(eq(maintenanceMode.key, MAINTENANCE_MODE_KEY))
    .limit(1);

  return rows[0]?.enabled ?? false;
}
