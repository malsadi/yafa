import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { settings } from '../../../db/schema/core/settings';

/** Reads the raw (JSON-encoded) stored value for one key at one scope, or null. */
export async function readStoredValue(
  db: D1Database,
  key: string,
  scope: string,
): Promise<string | null> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ value: settings.value })
    .from(settings)
    .where(and(eq(settings.key, key), eq(settings.scope, scope)))
    .limit(1);

  return rows[0]?.value ?? null;
}
