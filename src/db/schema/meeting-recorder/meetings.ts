import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  ATTENDANCE_MARKS,
  MEETING_STATUSES,
} from '../../../shared/meeting-recorder/meeting-statuses';

// Brief 22 and D-198 to D-210: a meeting — its type (from the meeting types
// list), date and start time, place and/or online link, chair and
// secretary. Scheduled → Held → Report logged, or Cancelled from Scheduled
// with a reason (D-202). Never deleted; locked once its report is logged
// or it is cancelled. Each save sends its version (9.1). Each hub message
// and the calendar entry are recorded once, when sent (D-209).
export const meetings = sqliteTable(
  'meetings',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    typeItemId: text('type_item_id').notNull(),
    date: text('date').notNull(),
    startTime: text('start_time').notNull(),
    place: text('place'),
    onlineLink: text('online_link'),
    chairPersonId: text('chair_person_id').notNull(),
    secretaryPersonId: text('secretary_person_id').notNull(),
    status: text('status', { enum: MEETING_STATUSES as [string, ...string[]] }).notNull(),
    heldAt: text('held_at'),
    heldBy: text('held_by'),
    cancelReason: text('cancel_reason'),
    cancelledAt: text('cancelled_at'),
    cancelledBy: text('cancelled_by'),
    loggedAt: text('logged_at'),
    loggedBy: text('logged_by'),
    reportFileId: text('report_file_id'),
    calendarWrittenAt: text('calendar_written_at'),
    scheduledPostedAt: text('scheduled_posted_at'),
    heldPostedAt: text('held_posted_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('meetings_unit_date').on(table.unitId, table.date)],
);

// Brief 22 A2 and D-203: an attendee, chosen from the unit's officers, marked
// on the day present, sending apologies, or did not attend.
export const meetingAttendees = sqliteTable(
  'meeting_attendees',
  {
    meetingId: text('meeting_id').notNull(),
    personId: text('person_id').notNull(),
    attendance: text('attendance', { enum: ATTENDANCE_MARKS as [string, ...string[]] }),
  },
  (table) => [primaryKey({ columns: [table.meetingId, table.personId] })],
);

// Brief 22 A3, B2 and D-204, D-206: an agenda item — its title and note,
// whether it was raised in the meeting, and its vote or decision.
export const agendaItems = sqliteTable(
  'agenda_items',
  {
    id: text('id').primaryKey(),
    meetingId: text('meeting_id').notNull(),
    position: integer('position').notNull(),
    title: text('title').notNull(),
    note: text('note'),
    raisedInMeeting: integer('raised_in_meeting', { mode: 'boolean' }).notNull(),
    outcomeKind: text('outcome_kind', { enum: ['vote', 'decision'] }),
    votesFor: integer('votes_for'),
    votesAgainst: integer('votes_against'),
    votesAbstain: integer('votes_abstain'),
    voteResult: text('vote_result'),
    decision: text('decision'),
    version: integer('version').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('agenda_items_meeting').on(table.meetingId, table.position)],
);

// Brief 22 B1 and D-205: an attending officer's comment under an agenda item.
export const agendaComments = sqliteTable(
  'agenda_comments',
  {
    itemId: text('item_id').notNull(),
    personId: text('person_id').notNull(),
    comment: text('comment').notNull(),
    version: integer('version').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.personId] })],
);
