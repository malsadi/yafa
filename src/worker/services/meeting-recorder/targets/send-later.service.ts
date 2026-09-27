import type { MeetingSummary } from '../../../../shared/meeting-recorder/meeting-records';
import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { ConflictError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import type { NotificationsQueue } from '../../communication-hub';
import { requireMeetingCapability, requireWritable, runMeetingBatch } from '../meeting-access';
import { requireUnitMeeting } from '../meetings/meeting-guards';
import { MANAGE } from '../meetings/meetings.service';
import {
  alertMessage,
  calendarStatements,
  hubMessageStatements,
  type HubMessage,
} from './meeting-targets';

export type LateTarget = 'calendar' | HubMessage;

/** D-209: what may still be sent — never for a cancelled meeting (D-202), each only once. */
function stillDue(meeting: MeetingSummary, target: LateTarget): boolean {
  if (meeting.status === MeetingStatus.Cancelled) return false;
  if (target === 'calendar') return meeting.calendarWrittenAt === null;
  if (target === 'meeting-scheduled') return meeting.scheduledPostedAt === null;
  return meeting.status === MeetingStatus.ReportLogged && meeting.heldPostedAt === null;
}

/**
 * D-209: a Calendar entry or hub message skipped while its service was
 * off, sent once it is back on, by those who manage meetings.
 */
export async function sendLater(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  params: { unitId: string; meetingId: string; target: LateTarget },
): Promise<void> {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  if (!stillDue(meeting, params.target))
    throw new ConflictError('meeting-recorder.nothing-to-send');
  const at = new Date().toISOString();
  const sent =
    params.target === 'calendar'
      ? { statements: await calendarStatements(db, meeting, at), noticeId: null }
      : await hubMessageStatements(db, meeting, params.target, { actor: ctx.personId, at });
  if (sent.statements.length === 0) throw new ConflictError('meeting-recorder.service-off');
  await runMeetingBatch(db, sent.statements);
  await alertMessage(queue, params.unitId, sent.noticeId, ctx.personId);
}
