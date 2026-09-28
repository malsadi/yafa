import type { AuditSearch } from '../../../../shared/administration-panel/audit-entry';
import { AUDIT_ACTION_SERVICES } from '../../../../shared/administration-panel/audit-services';
import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { londonDayStart } from '../../../../shared/core/london-day-start';

export interface AuditRow {
  id: string;
  occurredAt: string;
  actorPersonId: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before: string | null;
  after: string | null;
}

/** The search as SQL conditions — each on an indexed column where it can be. */
function conditionsOf(search: AuditSearch): { where: string; values: string[] } {
  const parts: string[] = [];
  const values: string[] = [];
  const add = (condition: string, value: string | undefined) => {
    if (!value) return;
    parts.push(condition);
    values.push(value);
  };
  add('a.actor_person_id = ?', search.personId);
  add('a.entity_type = ?', search.entityType);
  add('a.entity_id = ?', search.entityId);
  add('a.occurred_at >= ?', search.from && londonDayStart(search.from));
  add('a.occurred_at < ?', search.to && londonDayStart(addDaysToDate(search.to, 1)));
  if (search.service) {
    const prefixes = Object.entries(AUDIT_ACTION_SERVICES)
      .filter(([, service]) => service === search.service)
      .map(([prefix]) => prefix);
    parts.push(`(${prefixes.map(() => 'a.action LIKE ?').join(' OR ') || '0'})`);
    values.push(...prefixes.map((p) => `${p}.%`));
  }
  return { where: parts.length ? `WHERE ${parts.join(' AND ')}` : '', values };
}

/** Brief 25 D2: the matching entries, the latest first — a page of them, or all for the CSV. */
export async function searchAudit(
  db: D1Database,
  search: AuditSearch,
  window: { limit: number; offset: number } | null,
): Promise<{ rows: AuditRow[]; total: number }> {
  const { where, values } = conditionsOf(search);
  const paging = window ? 'LIMIT ? OFFSET ?' : '';
  const [rows, count] = await db.batch([
    db
      .prepare(
        `SELECT a.id, a.occurred_at AS occurredAt, a.actor_person_id AS actorPersonId, p.name AS actorName,
           a.action, a.entity_type AS entityType, a.entity_id AS entityId, a.before, a.after
         FROM audit_log a LEFT JOIN people p ON p.id = a.actor_person_id
         ${where} ORDER BY a.occurred_at DESC, a.id DESC ${paging}`,
      )
      .bind(...values, ...(window ? [window.limit, window.offset] : [])),
    db.prepare(`SELECT COUNT(*) AS total FROM audit_log a ${where}`).bind(...values),
  ]);
  return {
    rows: (rows?.results ?? []) as AuditRow[],
    total: ((count?.results ?? [])[0] as { total: number } | undefined)?.total ?? 0,
  };
}

/** Everyone who appears in the audit log, by name — to filter by. */
export async function listAuditActors(
  db: D1Database,
): Promise<{ personId: string; name: string | null }[]> {
  const { results } = await db
    .prepare(
      `SELECT a.actor_person_id AS personId, MAX(p.name) AS name FROM audit_log a
       LEFT JOIN people p ON p.id = a.actor_person_id GROUP BY a.actor_person_id ORDER BY name`,
    )
    .all<{ personId: string; name: string | null }>();
  return results;
}
