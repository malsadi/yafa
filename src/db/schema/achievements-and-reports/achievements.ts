import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { ANNUAL_REPORT_STATUSES } from '../../../shared/achievements-and-reports/annual-report-statuses';

// Brief 24 A1 and D-215 (O-151, O-152): an achievement — its title, date,
// category (from the achievement categories list) and description. Changed,
// or withdrawn and brought back, until its year's annual report is
// finalised; then locked. Never deleted; each save sends its version (9.1).
export const achievements = sqliteTable(
  'achievements',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    title: text('title').notNull(),
    achievementDate: text('achievement_date').notNull(),
    categoryItemId: text('category_item_id').notNull(),
    description: text('description').notNull(),
    withdrawnAt: text('withdrawn_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('achievements_unit_date').on(table.unitId, table.achievementDate)],
);

// Brief 24 A1 and O-151: the officers an achievement is credited to — anyone
// who has held a term in the unit, past officers included.
export const achievementOfficers = sqliteTable(
  'achievement_officers',
  {
    achievementId: text('achievement_id').notNull(),
    personId: text('person_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.achievementId, table.personId] }),
    index('achievement_officers_person').on(table.personId),
  ],
);

// Brief 24 A1: an achievement's photos, under the "media images" rules. A
// photo is removed by retiring it, kept in storage (D-213 choice).
export const achievementPhotos = sqliteTable(
  'achievement_photos',
  {
    achievementId: text('achievement_id').notNull(),
    fileId: text('file_id').notNull(),
    retiredAt: text('retired_at'),
    addedBy: text('added_by').notNull(),
    addedAt: text('added_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.achievementId, table.fileId] })],
);

// Brief 24 B2 and D-215 (O-154 to O-158): a unit's annual report for one
// year. A draft shows the latest figures and the branch's summary; once
// finalised its content is frozen, its PDF filed, and nothing changes.
export const annualReports = sqliteTable(
  'annual_reports',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    year: integer('year').notNull(),
    periodStart: text('period_start').notNull(),
    periodEnd: text('period_end').notNull(),
    status: text('status', {
      enum: ANNUAL_REPORT_STATUSES as unknown as [string, ...string[]],
    }).notNull(),
    summary: text('summary'),
    content: text('content'),
    language: text('language', { enum: ['en', 'ar'] }),
    fileId: text('file_id'),
    finalisedBy: text('finalised_by'),
    finalisedAt: text('finalised_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('annual_reports_unit_year').on(table.unitId, table.year)],
);
