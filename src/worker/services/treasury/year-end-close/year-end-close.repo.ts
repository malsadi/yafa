import { generateId } from '../../../core/ids';

export interface ClosedYearRow {
  start: string;
  end: string;
  closedAt: string;
  closedByName: string | null;
}

export async function listClosedYears(db: D1Database, unitId: string): Promise<ClosedYearRow[]> {
  const result = await db
    .prepare(
      `SELECT y.start_date AS start, y.end_date AS end, y.closed_at AS closedAt, p.name AS closedByName
       FROM treasury_financial_years y LEFT JOIN people p ON p.id = y.closed_by
       WHERE y.unit_id = ? ORDER BY y.start_date`,
    )
    .bind(unitId)
    .all<ClosedYearRow>();
  return result.results;
}

/** The date of the unit's earliest entry, if it has any. */
export async function earliestEntryDate(db: D1Database, unitId: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT MIN(entry_date) AS earliest FROM treasury_entries WHERE unit_id = ?')
    .bind(unitId)
    .first<{ earliest: string | null }>();
  return row?.earliest ?? null;
}

/** Entries dated in a period that await approval (P7). */
export async function awaitingBetween(
  db: D1Database,
  unitId: string,
  start: string,
  end: string,
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS awaiting FROM treasury_entries
       WHERE unit_id = ? AND approval_status = 'Awaiting approval' AND entry_date BETWEEN ? AND ?`,
    )
    .bind(unitId, start, end)
    .first<{ awaiting: number }>();
  return row?.awaiting ?? 0;
}

/** D-128: whether any entry dated before `start` sits in a year not yet closed. */
export async function earlierYearOpen(
  db: D1Database,
  unitId: string,
  start: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS open FROM treasury_entries e WHERE e.unit_id = ? AND e.entry_date < ?
         AND NOT EXISTS (SELECT 1 FROM treasury_financial_years y WHERE y.unit_id = e.unit_id
           AND e.entry_date BETWEEN y.start_date AND y.end_date)
       LIMIT 1`,
    )
    .bind(unitId, start)
    .first();
  return row !== null;
}

/** Brief 17 C3: the year closed, locking its entries (a trigger refuses any later entry in it). */
export function buildCloseYearStatement(
  db: D1Database,
  row: { unitId: string; start: string; end: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO treasury_financial_years (id, unit_id, start_date, end_date, closed_by, closed_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(generateId(), row.unitId, row.start, row.end, row.actor, row.at);
}
