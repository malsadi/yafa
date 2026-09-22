import { readMaintenanceModeEnabled } from './maintenance-mode-repo';

/** Readable by the banner (brief section 25 D6) and by the read-only gate. */
export async function isMaintenanceModeOn(db: D1Database): Promise<boolean> {
  return readMaintenanceModeEnabled(db);
}
