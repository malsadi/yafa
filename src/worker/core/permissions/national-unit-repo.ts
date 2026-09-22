import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { units } from '../../../db/schema/committee-register/units';

/**
 * T-041/T-050: whether `unitId` is itself the national unit — checked
 * against that specific unit's own `type`, not "the" national unit's id,
 * so `national content` resolution doesn't assume only one `type = 'national'`
 * row exists (nothing in the schema enforces that).
 */
export async function isNationalUnit(db: D1Database, unitId: string): Promise<boolean> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ id: units.id })
    .from(units)
    .where(and(eq(units.id, unitId), eq(units.type, 'national')))
    .limit(1);

  return rows.length > 0;
}
