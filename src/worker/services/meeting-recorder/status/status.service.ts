import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { buildRemoveCalendarEntryStatement } from '../../calendar';
import { requireChairSecretaryOrManager } from '../chair-or-secretary';
import { requireMeetingCapability, requireWritable, runMeetingBatch } from '../meeting-access';
import { requireStatus, requireUnitMeeting } from '../meetings/meeting-guards';
import { MANAGE } from '../meetings/meetings.service';

interface MeetingRef {
  unitId: string;
  meetingId: string;
  version: number;
}

/** D-201: "Held" is marked when the meeting starts, from its date onwards, by its chair, secretary or a manager. */
export async function holdMeeting(db: D1Database, ctx: RequestContext, params: MeetingRef) {
  const meeting = await requireChairSecretaryOrManager(db, ctx, params);
  requireStatus(meeting, MeetingStatus.Scheduled);
  if (meeting.date > getTodayInLondon()) throw new ConflictError('meeting-recorder.not-yet');
  const at = new Date().toISOString();
  await runMeetingBatch(db, [
    db
      .prepare(
        `UPDATE meetings SET status = 'Held', held_at = ?, held_by = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(at, ctx.personId, params.version + 1, ctx.personId, at, meeting.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.held',
      entityType: 'meeting',
      entityId: meeting.id,
    }),
  ]);
}

/**
 * D-202: a meeting that doesn't happen is cancelled from Scheduled, with a
 * reason, by those who manage meetings. It leaves the Calendar, is never
 * deleted, and sends no hub message (brief 22 allows only two).
 */
export async function cancelMeeting(
  db: D1Database,
  ctx: RequestContext,
  params: MeetingRef & { reason: string },
) {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  requireStatus(meeting, MeetingStatus.Scheduled);
  const at = new Date().toISOString();
  await runMeetingBatch(db, [
    db
      .prepare(
        `UPDATE meetings SET status = 'Cancelled', cancel_reason = ?, cancelled_at = ?, cancelled_by = ?,
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(params.reason, at, ctx.personId, params.version + 1, ctx.personId, at, meeting.id),
    ...(meeting.calendarWrittenAt === null
      ? []
      : [buildRemoveCalendarEntryStatement(db, { kind: 'meeting', sourceRecordId: meeting.id })]),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.cancelled',
      entityType: 'meeting',
      entityId: meeting.id,
      after: { reason: params.reason },
    }),
  ]);
}
