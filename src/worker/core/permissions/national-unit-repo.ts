import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { units } from '../../../db/schema/committee-register/units';

/** T-041: a `national content`-scoped grant resolves against this unit's id (brief section 7.1). */
export async function findNationalUnitId(db: D1Database): Promise<string | null> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ id: units.id })
    .from(units)
    .where(eq(units.type, 'national'))
    .limit(1);

  return rows[0]?.id ?? null;
}
