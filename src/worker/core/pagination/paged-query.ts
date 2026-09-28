import type { Page } from '../../../shared/core/page';
import { pageWindow, requireRowsPerPage } from './rows-per-page';

/**
 * Brief 26 Phase 12 and D-217 (O-169): one page of a list query — its rows
 * for the page asked for, and how many pages there are — in one batch.
 * `sql` is the whole ordered query, without a LIMIT. Until "Rows per page"
 * is set, lists wait (rule 5).
 */
export async function pagedQuery<T>(
  db: D1Database,
  query: { sql: string; binds: readonly unknown[] },
  page: number,
): Promise<Page<T>> {
  const rowsPerPage = await requireRowsPerPage(db);
  const window = pageWindow(page, rowsPerPage);
  const [rows, count] = await db.batch([
    db.prepare(`${query.sql} LIMIT ? OFFSET ?`).bind(...query.binds, window.limit, window.offset),
    db.prepare(`SELECT COUNT(*) AS total FROM (${query.sql})`).bind(...query.binds),
  ]);
  const total = ((count?.results ?? [])[0] as { total: number } | undefined)?.total ?? 0;
  return {
    items: (rows?.results ?? []) as T[],
    page: window.offset / rowsPerPage + 1,
    pageCount: Math.max(1, Math.ceil(total / rowsPerPage)),
  };
}

/** The page a request asks for, from its `page` query value; the first page otherwise. */
export function pageAsked(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
