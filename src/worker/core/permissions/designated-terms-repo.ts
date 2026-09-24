import { and, eq, isNotNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { roles } from '../../../db/schema/committee-register/roles';
import { terms } from '../../../db/schema/committee-register/terms';
import type { RoleDesignation } from '../../../shared/committee-register/role-designation';
import { currentTermCondition } from './current-term-condition';

export interface DesignatedTerm {
  unitId: string;
  designation: RoleDesignation;
}

/** A person's current terms in a designated role (brief 7.2), with each term's unit. */
export async function findDesignatedTerms(
  db: D1Database,
  personId: string,
  today: string,
): Promise<DesignatedTerm[]> {
  const orm = drizzle(db);
  const rows = await orm
    .select({ unitId: terms.unitId, designation: roles.designation })
    .from(terms)
    .innerJoin(roles, eq(roles.id, terms.roleId))
    .where(and(currentTermCondition(personId, today), isNotNull(roles.designation)));
  return rows.flatMap((row) =>
    row.designation
      ? [{ unitId: row.unitId, designation: row.designation as RoleDesignation }]
      : [],
  );
}
