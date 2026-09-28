import { ServiceUnavailableError } from '../errors';
import { getSetting } from '../settings';

/** D-217 (O-169): how many rows a page shows; until set, long lists wait (rule 5). */
export async function requireRowsPerPage(db: D1Database): Promise<number> {
  const rows = await getSetting<number>(db, 'administration-panel.rows_per_page');
  if (rows.status === 'not-configured') throw new ServiceUnavailableError('setting.not-configured');
  return rows.value;
}

/** The page asked for (from 1), and the SQL LIMIT and OFFSET for it. */
export function pageWindow(page: number, rowsPerPage: number): { limit: number; offset: number } {
  const safe = Number.isInteger(page) && page >= 1 ? page : 1;
  return { limit: rowsPerPage, offset: (safe - 1) * rowsPerPage };
}
