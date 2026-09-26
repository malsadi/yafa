import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 20 A1, D-154 and D-155: a unit's Noticeboard notice — posted by an
// officer, or an automatic post from the Event organiser or Meeting
// recorder, marked as automatic, which can't be changed. Retired and
// brought back, never deleted; each save sends its version (9.1).
export const notices = sqliteTable(
  'notices',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    /** 'officer', or 'automatic' (20 A1). */
    source: text('source').notNull(),
    /** For an automatic post: 'event-published', 'meeting-scheduled' or 'meeting-held'. */
    automaticKind: text('automatic_kind'),
    /** For an automatic post: the event or meeting it is about. */
    sourceRecordId: text('source_record_id'),
    title: text('title').notNull(),
    body: text('body'),
    /** For an automatic post: the event's or meeting's date. An officer's notice has a title and text. */
    aboutDate: text('about_date'),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('notices_unit_created').on(table.unitId, table.createdAt)],
);
