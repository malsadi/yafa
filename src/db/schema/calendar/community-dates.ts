import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 19 A3 and D-145 to D-147: a community date — a title, a first and
// last day (the same for one day), an optional time and description. A
// unit's own, or the General Council's for all branches. Retired and
// brought back, never deleted; each save sends its version (9.1).
export const communityDates = sqliteTable(
  'community_dates',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    title: text('title').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    startTime: text('start_time'),
    description: text('description'),
    forAllBranches: integer('for_all_branches', { mode: 'boolean' }).notNull(),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('community_dates_unit_date').on(table.unitId, table.startDate),
    index('community_dates_all_branches').on(table.forAllBranches, table.startDate),
  ],
);
