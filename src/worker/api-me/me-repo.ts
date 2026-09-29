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
 * Names for the units the officer works in: those they hold a term in
 * (`RequestContext.units`), or every unit when D-221's all-units grant
 * reaches them all (`unitIds` is then `'all'`).
 */
export async function findUnitsByIds(
  db: D1Database,
  unitIds: readonly string[] | 'all',
): Promise<{ id: string; type: 'national' | 'branch'; nameEn: string; nameAr: string }[]> {
  if (unitIds !== 'all' && unitIds.length === 0) {
    return [];
  }
  const query = drizzle(db)
    .select({ id: units.id, type: units.type, nameEn: units.nameEn, nameAr: units.nameAr })
    .from(units);
  return (unitIds === 'all' ? query : query.where(inArray(units.id, [...unitIds]))).orderBy(
    units.nameEn,
  );
}
