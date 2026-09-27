import type {
  MeetingDetail,
  MeetingSummary,
} from '../../../../shared/meeting-recorder/meeting-records';
import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { buildCalendarEntryStatement } from '../../calendar';
import type { NotificationsQueue } from '../../communication-hub';
import { requireMeetingCapability, requireWritable, runMeetingBatch } from '../meeting-access';
import {
  alertMessage,
  calendarEntry,
  calendarStatements,
  hubMessageStatements,
} from '../targets/meeting-targets';
import { buildAttendeeStatements, listAgenda, listAttendees } from './meeting-detail.repo';
import {
  requireMeetingType,
  requireOfficers,
  requireStatus,
  requireUnitMeeting,
} from './meeting-guards';
import {
  buildInsertMeetingStatement,
  buildUpdateMeetingStatement,
  findTypeNames,
  listUnitMeetings,
} from './meetings.repo';
import type { MeetingInput } from './meetings.schema';

export const READ = 'meeting-recorder.meetings.read';
export const MANAGE = 'meeting-recorder.meetings.manage';

/** D-199: the unit's meetings, for its own officers who see them. */
export async function unitMeetings(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<MeetingSummary[]> {
  await requireMeetingCapability(db, ctx, READ, unitId);
  return listUnitMeetings(db, unitId);
}

/** Brief 22: one meeting, with its attendees and its agenda and minutes. */
export async function oneMeeting(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; meetingId: string },
): Promise<MeetingDetail> {
  await requireMeetingCapability(db, ctx, READ, params.unitId);
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  const [attendees, agenda] = await Promise.all([
    listAttendees(db, meeting.id),
    listAgenda(db, meeting.id),
  ]);
  return { meeting, attendees, agenda };
}

/**
 * Brief 22 A1, A2, 10.1 ("Meeting details saved") and D-198, D-209: the
 * meeting, Scheduled, with its attendees (the chair and secretary among
 * them), shown in the Calendar and posted "meeting scheduled", in one batch
 * — each skipped while its service is off. The alert follows through the Queue.
 */
export async function scheduleMeeting(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  unitId: string,
  input: { meeting: MeetingInput; attendeePersonIds: string[] },
) {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, unitId));
  const { meeting } = input;
  await requireMeetingType(db, meeting.typeItemId);
  const people = [meeting.chairPersonId, meeting.secretaryPersonId, ...input.attendeePersonIds];
  await requireOfficers(db, unitId, people);
  const id = generateId();
  const at = new Date().toISOString();
  const target = { ...meeting, id, unitId, ...(await findTypeNames(db, meeting.typeItemId)) };
  const post = await hubMessageStatements(db, target, 'meeting-scheduled', {
    actor: ctx.personId,
    at,
  });
  await runMeetingBatch(db, [
    buildInsertMeetingStatement(db, { ...meeting, id, unitId, actor: ctx.personId, at }),
    ...buildAttendeeStatements(db, id, people),
    ...(await calendarStatements(db, target, at)),
    ...post.statements,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.scheduled',
      entityType: 'meeting',
      entityId: id,
      after: input,
    }),
  ]);
  await alertMessage(queue, unitId, post.noticeId, ctx.personId);
  return { id };
}

/** D-202: the details changed while Scheduled; the Calendar entry follows; no second hub message. */
export async function changeMeetingDetails(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; meetingId: string; version: number; meeting: MeetingInput },
): Promise<void> {
  requireWritable(await requireMeetingCapability(db, ctx, MANAGE, params.unitId));
  const before = await requireUnitMeeting(db, params.unitId, params.meetingId);
  requireStatus(before, MeetingStatus.Scheduled);
  await requireMeetingType(db, params.meeting.typeItemId, before.typeItemId);
  const people = [params.meeting.chairPersonId, params.meeting.secretaryPersonId];
  await requireOfficers(db, params.unitId, people, [
    before.chairPersonId,
    before.secretaryPersonId,
  ]);
  const at = new Date().toISOString();
  const after = {
    ...before,
    ...params.meeting,
    ...(await findTypeNames(db, params.meeting.typeItemId)),
  };
  await runMeetingBatch(db, [
    buildUpdateMeetingStatement(db, {
      ...params.meeting,
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    ...buildAttendeeStatements(db, before.id, people),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.changed',
      entityType: 'meeting',
      entityId: before.id,
      after: params.meeting,
    }),
    ...(before.calendarWrittenAt === null
      ? []
      : [buildCalendarEntryStatement(db, calendarEntry(after))]),
  ]);
}
