import { and, eq, gt, isNull, lte, or, type SQL } from 'drizzle-orm';
import { terms } from '../../../db/schema/committee-register/terms';

/**
 * The term-currency predicate, shared by every query that must only see a
 * person's current terms — kept in one place so the rule can't drift
 * between the callers that need it. Fails closed (D-029): `start_date` is
 * on or before `today` (powers begin on the start date, inclusive), and
 * `end_date` is null or strictly after `today` (powers end on the end
 * date — D-019, exclusive, "past ... from that date onward"). `today` is a
 * `YYYY-MM-DD` string (today-in-london.ts).
 */
export function currentTermCondition(personId: string, today: string): SQL | undefined {
  return and(
    eq(terms.personId, personId),
    lte(terms.startDate, today),
    or(isNull(terms.endDate), gt(terms.endDate, today)),
  );
}
