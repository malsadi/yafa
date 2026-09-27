import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { isServiceEnabled } from '../../../core/service-switches';
import { buildRemoveCalendarEntryStatement } from '../../calendar';
import { postAutomatic } from '../../communication-hub';

/**
 * D-190: what cancelling does to a published event — its Calendar entry is
 * removed, and, if it was announced on the Noticeboard, a new automatic
 * "cancelled" post is made (the announcement itself never changes). With
 * the Communication hub off, the post waits to be made later, once.
 */
export async function cancellationStatements(
  db: D1Database,
  event: EventSummary,
  actor: string,
  at: string,
): Promise<{ statements: D1PreparedStatement[]; noticeId: string | null }> {
  const statements: D1PreparedStatement[] = [];
  if (event.calendarPublishedAt !== null)
    statements.push(
      buildRemoveCalendarEntryStatement(db, { kind: 'event', sourceRecordId: event.id }),
    );
  const post = await cancellationPost(db, event, actor, at);
  return { statements: [...statements, ...post.statements], noticeId: post.noticeId };
}

/** D-190: the "cancelled" post, if the event was announced, not yet posted, and the hub is on. */
export async function cancellationPost(
  db: D1Database,
  event: EventSummary,
  actor: string,
  at: string,
): Promise<{ statements: D1PreparedStatement[]; noticeId: string | null }> {
  const due = event.noticeboardPublishedAt !== null && event.cancellationPostedAt === null;
  if (!due || !(await isServiceEnabled(db, 'communication-hub', event.unitId)))
    return { statements: [], noticeId: null };
  const post = postAutomatic(db, event.unitId, 'event-cancelled', {
    sourceRecordId: event.id,
    title: event.name,
    date: event.firstDay,
    actorPersonId: actor,
  });
  return {
    statements: [
      post.statement,
      db
        .prepare('UPDATE events SET cancellation_posted_at = ?, version = version + 1 WHERE id = ?')
        .bind(at, event.id),
    ],
    noticeId: post.noticeId,
  };
}
