import type { CalendarItem, CalendarUnit } from '../../../../shared/calendar/calendar-records';

const UNIT_COLS = `u.id AS unitId, u.name_en AS unitNameEn, u.name_ar AS unitNameAr, c.colour`;
const UNIT_JOIN = `JOIN units u ON u.id = x.unit_id LEFT JOIN list_items c ON c.id = u.calendar_colour_id`;

const marks = (ids: string[]) => ids.map(() => '?').join(', ');

/** Brief 19 A1, A2 and D-189: meetings and events of these units overlapping the period, from the read-model. */
export async function listEntries(
  db: D1Database,
  unitIds: string[],
  period: { from: string; to: string },
): Promise<CalendarItem[]> {
  if (unitIds.length === 0) return [];
  const { results } = await db
    .prepare(
      `SELECT x.kind, x.source_record_id AS id, ${UNIT_COLS}, x.title, x.date AS startDate, COALESCE(x.last_date, x.date) AS endDate,
         x.start_time AS startTime, NULL AS description, 0 AS forAllBranches, NULL AS retiredAt, NULL AS version
       FROM calendar_entries x ${UNIT_JOIN}
       WHERE x.unit_id IN (${marks(unitIds)}) AND x.date <= ? AND COALESCE(x.last_date, x.date) >= ?`,
    )
    .bind(...unitIds, period.to, period.from)
    .all<CalendarItem>();
  return results.map((r) => ({ ...r, forAllBranches: false }));
}

/** Brief 19 A3: community dates of these units, and any for all branches, overlapping the period. */
export async function listCommunityDates(
  db: D1Database,
  params: { unitIds: string[]; allBranches: boolean; from: string; to: string },
): Promise<CalendarItem[]> {
  const owners = params.unitIds.length ? `x.unit_id IN (${marks(params.unitIds)})` : '0';
  const { results } = await db
    .prepare(
      `SELECT 'community' AS kind, x.id, ${UNIT_COLS}, x.title, x.start_date AS startDate, x.end_date AS endDate,
         x.start_time AS startTime, x.description, x.for_all_branches AS forAllBranches, x.retired_at AS retiredAt, x.version
       FROM community_dates x ${UNIT_JOIN}
       WHERE (${owners} OR (? AND x.for_all_branches = 1)) AND x.start_date <= ? AND x.end_date >= ?`,
    )
    .bind(...params.unitIds, params.allBranches ? 1 : 0, params.to, params.from)
    .all<Omit<CalendarItem, 'forAllBranches'> & { forAllBranches: number }>();
  return results.map((r) => ({ ...r, forAllBranches: r.forAllBranches === 1 }));
}

/** Brief 19 B2, B3: every unit, with its calendar colour. */
export async function listCalendarUnits(db: D1Database): Promise<CalendarUnit[]> {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.name_en AS nameEn, u.name_ar AS nameAr, c.colour
       FROM units u LEFT JOIN list_items c ON c.id = u.calendar_colour_id ORDER BY u.type DESC, u.name_en`,
    )
    .all<CalendarUnit>();
  return results;
}
