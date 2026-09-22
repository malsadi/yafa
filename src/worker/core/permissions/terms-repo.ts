import { drizzle } from 'drizzle-orm/d1';
import { terms } from '../../../db/schema/committee-register/terms';
import { currentTermCondition } from './current-term-condition';

export interface CurrentTerm {
  unitId: string;
  roleId: string;
}

/** A person's current terms only (D-019/D-029: see current-term-condition.ts). */
export async function findCurrentTerms(
  db: D1Database,
  personId: string,
  today: string,
): Promise<CurrentTerm[]> {
  const orm = drizzle(db);
  return orm
    .select({ unitId: terms.unitId, roleId: terms.roleId })
    .from(terms)
    .where(currentTermCondition(personId, today));
}
