import { and, asc, desc, eq, gt, isNotNull, lte, or, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { people } from '../../../../db/schema/committee-register/people';
import { roles } from '../../../../db/schema/committee-register/roles';
import { terms } from '../../../../db/schema/committee-register/terms';
import type { OfficerRecord } from './officers.schema';

const COLUMNS = {
  termId: terms.id,
  personId: people.id,
  name: people.name,
  email: people.email,
  phone: people.phone,
  roleId: roles.id,
  roleNameEn: roles.nameEn,
  roleNameAr: roles.nameAr,
  startDate: terms.startDate,
  endDate: terms.endDate,
};

function officersOf(db: D1Database) {
  return drizzle(db)
    .select(COLUMNS)
    .from(terms)
    .innerJoin(people, eq(people.id, terms.personId))
    .innerJoin(roles, eq(roles.id, terms.roleId));
}

/**
 * A unit's terms that have not ended (D-019): current, and any starting
 * later (D-029: no powers until then). Ordered by role, then name.
 */
export async function listUnendedTerms(
  db: D1Database,
  unitId: string,
  today: string,
): Promise<OfficerRecord[]> {
  return officersOf(db)
    .where(and(eq(terms.unitId, unitId), or(isNull(terms.endDate), gt(terms.endDate, today))))
    .orderBy(asc(roles.nameEn), asc(people.name));
}

/** Brief 14 C3: a unit's past officers, most recently ended first. */
export async function listEndedTerms(
  db: D1Database,
  unitId: string,
  today: string,
): Promise<OfficerRecord[]> {
  return officersOf(db)
    .where(and(eq(terms.unitId, unitId), isNotNull(terms.endDate), lte(terms.endDate, today)))
    .orderBy(desc(terms.endDate), asc(people.name));
}

export async function findTerm(
  db: D1Database,
  termId: string,
): Promise<{
  id: string;
  personId: string;
  roleId: string;
  unitId: string;
  startDate: string;
  endDate: string | null;
} | null> {
  const rows = await drizzle(db).select().from(terms).where(eq(terms.id, termId)).limit(1);
  const row = rows[0];
  return row
    ? {
        id: row.id,
        personId: row.personId,
        roleId: row.roleId,
        unitId: row.unitId,
        startDate: row.startDate,
        endDate: row.endDate,
      }
    : null;
}

export async function findPersonByEmail(
  db: D1Database,
  email: string,
): Promise<{ id: string } | null> {
  const rows = await drizzle(db)
    .select({ id: people.id })
    .from(people)
    .where(eq(people.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function findPerson(
  db: D1Database,
  personId: string,
): Promise<{ id: string; name: string; phone: string } | null> {
  const rows = await drizzle(db)
    .select({ id: people.id, name: people.name, phone: people.phone })
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);
  return rows[0] ?? null;
}

/** Every unit a person has ever held a term in (brief 14: past terms stay). */
export async function listPersonUnitIds(db: D1Database, personId: string): Promise<string[]> {
  const rows = await drizzle(db)
    .selectDistinct({ unitId: terms.unitId })
    .from(terms)
    .where(eq(terms.personId, personId));
  return rows.map((row) => row.unitId);
}
