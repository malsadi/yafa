import { and, eq, inArray } from 'drizzle-orm';
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

/** Every stored switch row at any of the given scopes, in one query. */
export async function readServiceSwitchValuesForScopes(
  db: D1Database,
  scopes: readonly string[],
): Promise<{ service: string; scope: string; enabled: boolean }[]> {
  const orm = drizzle(db);
  return orm
    .select({
      service: serviceSwitches.service,
      scope: serviceSwitches.scope,
      enabled: serviceSwitches.enabled,
    })
    .from(serviceSwitches)
    .where(inArray(serviceSwitches.scope, [...scopes]));
}
