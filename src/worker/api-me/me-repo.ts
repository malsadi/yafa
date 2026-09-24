import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../db/schema/committee-register/people';
import { units } from '../../db/schema/committee-register/units';
import type { Language } from '../../shared/core/languages';

/** The officer's own saved language, or null if they have not chosen one. */
export async function findPersonLanguage(
  db: D1Database,
  personId: string,
): Promise<Language | null> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ language: people.language })
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);
  return rows[0]?.language ?? null;
}

export async function updatePersonLanguage(
  db: D1Database,
  personId: string,
  language: Language,
): Promise<void> {
  const orm = drizzle(db);
  await orm.update(people).set({ language }).where(eq(people.id, personId));
}

/**
 * Names for the units the officer currently holds a term in — only ever
 * called with `RequestContext.units`, so it never reveals another unit.
 */
export async function findUnitsByIds(
  db: D1Database,
  unitIds: readonly string[],
): Promise<{ id: string; type: 'national' | 'branch'; nameEn: string; nameAr: string }[]> {
  if (unitIds.length === 0) {
    return [];
  }
  const orm = drizzle(db);
  return orm
    .select({ id: units.id, type: units.type, nameEn: units.nameEn, nameAr: units.nameAr })
    .from(units)
    .where(inArray(units.id, [...unitIds]))
    .orderBy(units.nameEn);
}
