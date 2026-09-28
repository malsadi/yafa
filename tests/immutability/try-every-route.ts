import { env } from 'cloudflare:workers';
import { listRegisteredRoutes } from '../../src/worker/core/permissions';

// Brief 26, Phase 12: "Immutability review: try to change every locked
// thing through every route." Given a locked record, this calls every
// registered route that could change it — every method but GET under the
// record's path — as an officer who holds every capability for the unit,
// and reports any that succeeded. The rows the caller names are read
// before and after: a locked record must come out exactly as it went in.

export type Caller = (method: string, path: string, body?: unknown) => Promise<Response>;

export interface LockedRecord {
  /** The record's route prefixes as registered, e.g. `/api/…/events/:eventId`. */
  prefixes: string[];
  /** A value for each path parameter; any other parameter gets `none`. */
  params: Record<string, string>;
  /** A valid body for a route, by `METHOD path` as registered, so the lock itself is what refuses it. */
  bodies?: Record<string, unknown>;
  /** SQL reads of every row that belongs to the record. */
  rows: { sql: string; binds: unknown[] }[];
}

const fill = (path: string, params: Record<string, string>) =>
  path.replace(/:([A-Za-z]+)/g, (_, name: string) => params[name] ?? 'none');

async function readRows(rows: LockedRecord['rows']): Promise<string> {
  const results = await Promise.all(
    rows.map(
      async ({ sql, binds }) =>
        (
          await env.DB.prepare(sql)
            .bind(...binds)
            .all()
        ).results,
    ),
  );
  return JSON.stringify(results);
}

/**
 * The routes that answered 2xx (so could change the record), those that
 * failed with a 500, and whether the record's rows changed.
 */
export async function tryEveryRoute(
  call: Caller,
  record: LockedRecord,
): Promise<{ tried: string[]; accepted: string[]; failed: string[]; rowsChanged: boolean }> {
  const before = await readRows(record.rows);
  const routes = listRegisteredRoutes().filter(
    (r) =>
      r.method !== 'GET' &&
      record.prefixes.some((prefix) => r.path === prefix || r.path.startsWith(`${prefix}/`)),
  );
  const tried: string[] = [];
  const accepted: string[] = [];
  const failed: string[] = [];
  for (const route of routes) {
    const key = `${route.method} ${route.path}`;
    tried.push(key);
    const res = await call(
      route.method,
      fill(route.path, record.params),
      record.bodies?.[key] ?? {},
    );
    // A 500 means the service didn't check the lock and the database stopped it (rule 5
    // wants both). A 503 is the portal's own "waiting for a setting" refusal.
    if (res.status === 500) failed.push(`${key} → ${String(res.status)}`);
    if (res.ok) accepted.push(`${key} → ${String(res.status)}`);
  }
  return { tried, accepted, failed, rowsChanged: before !== (await readRows(record.rows)) };
}
