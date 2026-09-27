import type { FeedEvent } from './ics';

type Row = Omit<FeedEvent, 'uid'> & { kind: string; id: string; unitName: string };

const marks = (ids: string[]) => ids.map(() => '?').join(', ');

/**
 * Brief 19 C1 and D-148: the meetings, events and live community dates of
 * these units, and, when asked, the General Council's live dates for all
 * branches — each titled with its unit's name in the officer's language.
 */
export async function listFeedRows(
  db: D1Database,
  params: { unitIds: string[]; allBranchDates: boolean; language: 'en' | 'ar' },
): Promise<(FeedEvent & { unitName: string })[]> {
  const name = params.language === 'ar' ? 'u.name_ar' : 'u.name_en';
  const owners = params.unitIds.length ? `IN (${marks(params.unitIds)})` : 'IN (NULL)';
  const { results } = await db
    .prepare(
      `SELECT x.kind, x.source_record_id AS id, ${name} AS unitName, x.title, NULL AS description,
         x.date AS startDate, COALESCE(x.last_date, x.date) AS endDate, x.start_time AS startTime
       FROM calendar_entries x JOIN units u ON u.id = x.unit_id WHERE x.unit_id ${owners}
       UNION ALL
       SELECT 'community', x.id, ${name}, x.title, x.description, x.start_date, x.end_date, x.start_time
       FROM community_dates x JOIN units u ON u.id = x.unit_id
       WHERE x.retired_at IS NULL AND (x.unit_id ${owners} OR (? AND x.for_all_branches = 1))
       ORDER BY 6`,
    )
    .bind(...params.unitIds, ...params.unitIds, params.allBranchDates ? 1 : 0)
    .all<Row>();
  return results.map(({ kind, id, ...row }) => ({ ...row, uid: `${kind}-${id}@yafa-portal` }));
}
