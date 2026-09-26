import { index, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Brief 19 build notes and 10.1, 10.3: the read-model of meetings and
// events — written only by their owning services, in their own batches
// (the Meeting recorder, Phase 9; the Event organiser, Phase 8), and
// read-only in the Calendar, whose API has no way to change it.
export const calendarEntries = sqliteTable(
  'calendar_entries',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    kind: text('kind', { enum: ['meeting', 'event'] }).notNull(),
    sourceRecordId: text('source_record_id').notNull(),
    title: text('title').notNull(),
    date: text('date').notNull(),
    startTime: text('start_time'),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('calendar_entries_unit_date').on(table.unitId, table.date),
    index('calendar_entries_date').on(table.date),
    uniqueIndex('calendar_entries_source').on(table.kind, table.sourceRecordId),
  ],
);
