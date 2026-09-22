import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { systemAdministrators } from '../../../db/schema/core/system-administrators';

/** T-038: backs `isSystemAdmin` in the request context (brief section 6.3). */
export async function isSystemAdministrator(db: D1Database, personId: string): Promise<boolean> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ personId: systemAdministrators.personId })
    .from(systemAdministrators)
    .where(eq(systemAdministrators.personId, personId))
    .limit(1);

  return rows.length > 0;
}
