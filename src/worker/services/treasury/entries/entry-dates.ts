import { ConflictError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';

/** Whether a date falls in one of the unit's closed financial years. */
export async function inClosedYear(db: D1Database, unitId: string, date: string): Promise<boolean> {
  const row = await db
    .prepare(
      'SELECT 1 AS closed FROM treasury_financial_years WHERE unit_id = ? AND ? BETWEEN start_date AND end_date',
    )
    .bind(unitId, date)
    .first<{ closed: number }>();
  return row !== null;
}

/**
 * D-121: an entry is dated any day up to today (London, 9.1), in an open
 * financial year — never in the future, never in a closed year (a trigger
 * also refuses the second).
 */
export async function requireEntryDate(
  db: D1Database,
  unitId: string,
  date: string,
): Promise<void> {
  if (date > getTodayInLondon()) throw new ConflictError('treasury.future-date');
  if (await inClosedYear(db, unitId, date)) throw new ConflictError('treasury.closed-year');
}
