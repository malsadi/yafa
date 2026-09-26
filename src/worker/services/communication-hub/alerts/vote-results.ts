import type { NotificationsQueue } from './hub-alert-events';
import { queueHubAlert } from './queue-hub-alert';

/**
 * Brief 11 (Close votes), 20 A2 and 10.1: every vote past its closing time
 * on a live notice has its result alerts queued — once each, marked in the
 * same statement that finds it, however often the job runs.
 */
export async function queueVoteResults(
  db: D1Database,
  queue: NotificationsQueue,
  now: string,
): Promise<number> {
  const { results } = await db
    .prepare(
      `INSERT INTO vote_result_alerts (notice_id, queued_at)
       SELECT v.notice_id, ?1 FROM notice_votes v JOIN notices n ON n.id = v.notice_id
       WHERE v.closes_at <= ?1 AND n.retired_at IS NULL
         AND NOT EXISTS (SELECT 1 FROM vote_result_alerts a WHERE a.notice_id = v.notice_id)
       RETURNING notice_id AS noticeId, (SELECT unit_id FROM notices WHERE id = notice_id) AS unitId`,
    )
    .bind(now)
    .all<{ noticeId: string; unitId: string }>();
  for (const vote of results)
    await queueHubAlert(queue, {
      kind: 'vote-result',
      unitId: vote.unitId,
      noticeId: vote.noticeId,
    });
  return results.length;
}
