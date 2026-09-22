import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { serviceSwitches } from '../../../db/schema/core/service-switches';
import type { ServiceSlug } from '../../../shared/core/services';

/** Reads the stored on/off value for one service at one scope, or null. */
export async function readServiceSwitchValue(
  db: D1Database,
  service: ServiceSlug,
  scope: string,
): Promise<boolean | null> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ enabled: serviceSwitches.enabled })
    .from(serviceSwitches)
    .where(and(eq(serviceSwitches.service, service), eq(serviceSwitches.scope, scope)))
    .limit(1);

  return rows[0]?.enabled ?? null;
}
