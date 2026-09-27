import type { MeetingSummary } from '../../../../shared/meeting-recorder/meeting-records';
import { isServiceEnabled } from '../../../core/service-switches';
import { buildCalendarEntryStatement, type CalendarEntryInput } from '../../calendar';
import { postAutomatic, queueHubAlert, type NotificationsQueue } from '../../communication-hub';

type Meeting = Pick<MeetingSummary, 'id' | 'unitId' | 'date' | 'startTime' | 'typeNameEn'>;

/** Brief 19 A1: what the Calendar shows of a meeting — written only by the Meeting recorder. */
export function calendarEntry(meeting: Meeting): CalendarEntryInput {
  return {
    unitId: meeting.unitId,
    kind: 'meeting',
    sourceRecordId: meeting.id,
    title: meeting.typeNameEn,
    date: meeting.date,
    lastDate: null,
    startTime: meeting.startTime,
  };
}

/** D-209: the Calendar entry, if the Calendar is on — and the meeting marked as having it. */
export async function calendarStatements(
  db: D1Database,
  meeting: Meeting,
  at: string,
): Promise<D1PreparedStatement[]> {
  if (!(await isServiceEnabled(db, 'calendar', meeting.unitId))) return [];
  return [
    buildCalendarEntryStatement(db, calendarEntry(meeting)),
    db
      .prepare(
        'UPDATE meetings SET calendar_written_at = COALESCE(calendar_written_at, ?), version = version + 1 WHERE id = ?',
      )
      .bind(at, meeting.id),
  ];
}

export type HubMessage = 'meeting-scheduled' | 'meeting-held';

const POSTED_COLUMN: Record<HubMessage, string> = {
  'meeting-scheduled': 'scheduled_posted_at',
  'meeting-held': 'held_posted_at',
};

/**
 * Brief 22 rules and 10.1: one of the Meeting recorder's two hub messages,
 * if the Communication hub is on — and the meeting marked as having sent
 * it, so it goes once (D-209). Its alert is queued after the batch.
 */
export async function hubMessageStatements(
  db: D1Database,
  meeting: Meeting,
  message: HubMessage,
  params: { actor: string; at: string },
): Promise<{ statements: D1PreparedStatement[]; noticeId: string | null }> {
  if (!(await isServiceEnabled(db, 'communication-hub', meeting.unitId)))
    return { statements: [], noticeId: null };
  const post = postAutomatic(db, meeting.unitId, message, {
    sourceRecordId: meeting.id,
    title: meeting.typeNameEn,
    date: meeting.date,
    actorPersonId: params.actor,
  });
  const column = POSTED_COLUMN[message];
  return {
    statements: [
      post.statement,
      db
        .prepare(
          `UPDATE meetings SET ${column} = COALESCE(${column}, ?), version = version + 1 WHERE id = ?`,
        )
        .bind(params.at, meeting.id),
    ],
    noticeId: post.noticeId,
  };
}

/** After the batch: the notice's alert through the Queue (10.1). */
export async function alertMessage(
  queue: NotificationsQueue,
  unitId: string,
  noticeId: string | null,
  author: string,
): Promise<void> {
  if (noticeId !== null)
    await queueHubAlert(queue, { kind: 'notice', unitId, noticeId, authorPersonId: author });
}
