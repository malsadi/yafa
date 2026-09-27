import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { findAgendaItem } from '../agenda/agenda.repo';
import { requireChairSecretaryOrManager } from '../chair-or-secretary';
import { runMeetingBatch } from '../meeting-access';
import type { Outcome } from './minutes.schema';

interface ItemRef {
  unitId: string;
  meetingId: string;
  itemId: string;
}

/** D-200 and D-201: the minutes are written while the meeting is held, by its chair, secretary or a manager. */
async function requireMinutes(db: D1Database, ctx: RequestContext, params: ItemRef) {
  const meeting = await requireChairSecretaryOrManager(db, ctx, params);
  if (meeting.status !== MeetingStatus.Held)
    throw new ConflictError('meeting-recorder.wrong-status');
  const item = await findAgendaItem(db, params.itemId);
  if (item?.meetingId !== meeting.id) throw new NotFoundError('meeting-recorder.item-not-found');
  return { meeting, item };
}

/**
 * Brief 22 B1 and D-205, D-207: an officer's comment under an item — only
 * an officer marked present — saved from the version read, so a save that
 * crosses another's is refused rather than lost.
 */
export async function saveComment(
  db: D1Database,
  ctx: RequestContext,
  params: ItemRef & { personId: string; comment: string; version: number | null },
): Promise<void> {
  const { meeting, item } = await requireMinutes(db, ctx, params);
  const at = new Date().toISOString();
  const write =
    params.version === null
      ? db
          .prepare(
            'INSERT INTO agenda_comments (item_id, person_id, comment, version, updated_by, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
          )
          .bind(item.id, params.personId, params.comment, ctx.personId, at)
      : db
          .prepare(
            'UPDATE agenda_comments SET comment = ?, version = ?, updated_by = ?, updated_at = ? WHERE item_id = ? AND person_id = ?',
          )
          .bind(params.comment, params.version + 1, ctx.personId, at, item.id, params.personId);
  await runComment(db, [
    write,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.comment-saved',
      entityType: 'meeting',
      entityId: meeting.id,
      after: { itemId: item.id, personId: params.personId },
    }),
  ]);
}

/** A new comment where one exists is a crossed save too (9.1); one for an officer not present is refused. */
async function runComment(db: D1Database, statements: D1PreparedStatement[]) {
  try {
    await runMeetingBatch(db, statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE'))
      throw new ConflictError('meeting-recorder.stale');
    if (error instanceof Error && error.message.includes('officers present'))
      throw new ConflictError('meeting-recorder.not-present');
    throw error;
  }
}

/** D-206: a vote's numbers together are no more than the officers present. */
async function requireVoteCount(db: D1Database, meetingId: string, outcome: Outcome) {
  if (outcome.kind !== 'vote') return;
  const present = await db
    .prepare(
      "SELECT COUNT(*) AS n FROM meeting_attendees WHERE meeting_id = ? AND attendance = 'Present'",
    )
    .bind(meetingId)
    .first<{ n: number }>();
  if (outcome.votesFor + outcome.votesAgainst + outcome.votesAbstain > (present?.n ?? 0))
    throw new ConflictError('meeting-recorder.too-many-votes');
}

/** Brief 22 B2 and D-206: the item's vote or decision, from the version read. */
export async function saveOutcome(
  db: D1Database,
  ctx: RequestContext,
  params: ItemRef & { outcome: Outcome; version: number },
): Promise<void> {
  const { meeting, item } = await requireMinutes(db, ctx, params);
  await requireVoteCount(db, meeting.id, params.outcome);
  const o = params.outcome;
  const vote = o.kind === 'vote' ? o : null;
  const at = new Date().toISOString();
  await runMeetingBatch(db, [
    db
      .prepare(
        `UPDATE agenda_items SET outcome_kind = ?, votes_for = ?, votes_against = ?, votes_abstain = ?, vote_result = ?,
           decision = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(
        o.kind,
        vote?.votesFor ?? null,
        vote?.votesAgainst ?? null,
        vote?.votesAbstain ?? null,
        vote?.voteResult ?? null,
        o.kind === 'decision' ? o.decision : null,
        params.version + 1,
        ctx.personId,
        at,
        item.id,
      ),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.outcome-saved',
      entityType: 'meeting',
      entityId: meeting.id,
      after: { itemId: item.id, ...o },
    }),
  ]);
}
