import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { isServiceEnabled } from '../../../core/service-switches';

/** The officer's units where the hub is on (8.4). */
export async function hubUnitsOf(db: D1Database, ctx: RequestContext): Promise<string[]> {
  const on = await Promise.all(
    ctx.units.map((unitId) => isServiceEnabled(db, 'communication-hub', unitId)),
  );
  return ctx.units.filter((_, i) => on[i]);
}

/** Conversations that cross units need the hub on in at least one of the officer's units. */
export async function requireHubSomewhere(db: D1Database, ctx: RequestContext): Promise<string[]> {
  const units = await hubUnitsOf(db, ctx);
  if (units.length === 0) throw new NotFoundError('service.switched-off');
  return units;
}

/** Which of these people are current officers of any unit. */
export async function currentOfficersAmong(
  db: D1Database,
  personIds: string[],
  today: string,
): Promise<string[]> {
  if (personIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT DISTINCT person_id AS personId FROM terms
       WHERE start_date <= ? AND (end_date IS NULL OR end_date > ?)
         AND person_id IN (${personIds.map(() => '?').join(', ')})`,
    )
    .bind(today, today, ...personIds)
    .all<{ personId: string }>();
  return results.map((row) => row.personId);
}
