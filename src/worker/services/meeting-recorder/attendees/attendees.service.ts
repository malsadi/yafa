import type { Attendance } from '../../../../shared/meeting-recorder/meeting-statuses';
import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireChairSecretaryOrManager } from '../chair-or-secretary';
import { requireMeetingCapability, requireWritable, runMeetingBatch } from '../meeting-access';
import { buildAttendeeStatements } from '../meetings/meeting-detail.repo';
import { requireOfficers, requireUnitMeeting } from '../meetings/meeting-guards';
import { MANAGE } from '../meetings/meetings.service';

interface MeetingRef {
  unitId: string;
  meetingId: string;
}

const OPEN: readonly string[] = [MeetingStatus.Scheduled, MeetingStatus.Held];

/** D-203: attendees change until the report is logged, by those who manage meetings. */
async function requireChangeable(db: D1Database, ctx: RequestContext, params: MeetingRef) {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  if (!OPEN.includes(meeting.status)) throw new ConflictError('meeting-recorder.locked');
  return meeting;
}

const audit = (db: D1Database, actor: string, meetingId: string, action: string, after: object) =>
  buildAuditStatement(db, {
    actorPersonId: actor,
    action,
    entityType: 'meeting',
    entityId: meetingId,
    after,
  });

/** Brief 22 A2 and D-203: officers chosen from the unit's current officers. */
export async function addAttendees(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { personIds: string[] },
): Promise<void> {
  const meeting = await requireChangeable(db, ctx, params);
  await requireOfficers(db, params.unitId, params.personIds);
  await runMeetingBatch(db, [
    ...buildAttendeeStatements(db, meeting.id, params.personIds),
    audit(db, ctx.personId, meeting.id, 'meeting.attendees-added', { personIds: params.personIds }),
  ]);
}

/**
 * An attendee taken off the list. The chair and secretary always attend
 * (D-198); someone whose comments are in the minutes stays, so the minutes
 * keep their author.
 */
export async function removeAttendee(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { personId: string },
): Promise<void> {
  const meeting = await requireChangeable(db, ctx, params);
  if (params.personId === meeting.chairPersonId || params.personId === meeting.secretaryPersonId)
    throw new ConflictError('meeting-recorder.chair-or-secretary');
  if (await hasComments(db, meeting.id, params.personId))
    throw new ConflictError('meeting-recorder.has-comments');
  await runMeetingBatch(db, [
    db
      .prepare('DELETE FROM meeting_attendees WHERE meeting_id = ? AND person_id = ?')
      .bind(meeting.id, params.personId),
    audit(db, ctx.personId, meeting.id, 'meeting.attendee-removed', { personId: params.personId }),
  ]);
}

async function hasComments(db: D1Database, meetingId: string, personId: string): Promise<boolean> {
  const row = await db
    .prepare(
      'SELECT 1 AS found FROM agenda_comments c JOIN agenda_items i ON i.id = c.item_id WHERE i.meeting_id = ? AND c.person_id = ?',
    )
    .bind(meetingId, personId)
    .first();
  return row !== null;
}

/**
 * Brief 22 A2 and D-203: on the day, each attendee marked present, sending
 * apologies, or did not attend — by the chair, secretary or a manager,
 * while the meeting is held. Someone with comments stays marked present.
 */
export async function markAttendance(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { personId: string; attendance: Attendance },
): Promise<void> {
  const meeting = await requireChairSecretaryOrManager(db, ctx, params);
  if (meeting.status !== MeetingStatus.Held)
    throw new ConflictError('meeting-recorder.wrong-status');
  if (params.attendance !== 'Present' && (await hasComments(db, meeting.id, params.personId)))
    throw new ConflictError('meeting-recorder.has-comments');
  const attendee = await db
    .prepare('SELECT 1 AS found FROM meeting_attendees WHERE meeting_id = ? AND person_id = ?')
    .bind(meeting.id, params.personId)
    .first();
  if (!attendee) throw new NotFoundError('meeting-recorder.attendee-not-found');
  await runMeetingBatch(db, [
    db
      .prepare('UPDATE meeting_attendees SET attendance = ? WHERE meeting_id = ? AND person_id = ?')
      .bind(params.attendance, meeting.id, params.personId),
    audit(db, ctx.personId, meeting.id, 'meeting.attendance-marked', {
      personId: params.personId,
      attendance: params.attendance,
    }),
  ]);
}
