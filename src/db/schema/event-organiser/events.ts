import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  EVENT_FILE_SECTIONS,
  EVENT_STATUSES,
} from '../../../shared/event-organiser/event-statuses';

// Brief 21 and D-172 to D-186: an event — its name, type (from the event
// types list), lead officer, first day with an optional time and an
// optional last day. Its status runs Draft to Closed, or to Cancelled with
// a reason and then Closed (D-181). Approved by a second officer (D-175);
// published once to each target (D-182). Never deleted; locked once
// Closed; each save sends its version (9.1).
export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    name: text('name').notNull(),
    typeItemId: text('type_item_id').notNull(),
    leadPersonId: text('lead_person_id').notNull(),
    firstDay: text('first_day').notNull(),
    startTime: text('start_time'),
    lastDay: text('last_day'),
    status: text('status', { enum: EVENT_STATUSES as [string, ...string[]] }).notNull(),
    templateId: text('template_id'),
    approvedBy: text('approved_by'),
    approvedAt: text('approved_at'),
    cancelReason: text('cancel_reason'),
    cancelledBy: text('cancelled_by'),
    cancelledAt: text('cancelled_at'),
    calendarPublishedAt: text('calendar_published_at'),
    noticeboardPublishedAt: text('noticeboard_published_at'),
    closedBy: text('closed_by'),
    closedAt: text('closed_at'),
    reportFileId: text('report_file_id'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('events_unit_status').on(table.unitId, table.status),
    index('events_unit_first_day').on(table.unitId, table.firstDay),
  ],
);

// Brief 21 F1, F2 and D-185: an event's files, in its Documents or Media
// section. Removable before the event closes; locked with it after.
export const eventFiles = sqliteTable(
  'event_files',
  {
    fileId: text('file_id').primaryKey(),
    eventId: text('event_id').notNull(),
    unitId: text('unit_id').notNull(),
    section: text('section', { enum: EVENT_FILE_SECTIONS as [string, ...string[]] }).notNull(),
    addedBy: text('added_by').notNull(),
    addedAt: text('added_at').notNull(),
  },
  (table) => [index('event_files_event').on(table.eventId, table.section)],
);
