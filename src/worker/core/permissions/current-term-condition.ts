import { and, eq, gt, isNull, or, type SQL } from 'drizzle-orm';
import { terms } from '../../../db/schema/committee-register/terms';

/**
 * D-019's term-currency predicate, shared by every query that must only see
 * a person's current terms: `end_date` is null, or strictly after `today`
 * (a `YYYY-MM-DD` string — today-in-london.ts). Kept in one place so the
 * rule can't drift between the callers that need it.
 */
export function currentTermCondition(personId: string, today: string): SQL | undefined {
  return and(eq(terms.personId, personId), or(isNull(terms.endDate), gt(terms.endDate, today)));
}
