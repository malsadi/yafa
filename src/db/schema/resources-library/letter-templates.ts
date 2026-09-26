import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 16 D1 and P19: a standard letter, written in the portal: title,
// subject, body with named fields, the field list, and its language. A
// national template (the General Council's) is for every branch; a
// branch's for that branch only (7.3). Retired and brought back, never
// deleted (D-100); each save sends the version it read (9.1).
export const letterTemplates = sqliteTable(
  'library_letter_templates',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    title: text('title').notNull(),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    /** D-101: the author's field names, a JSON array, in order. */
    fields: text('fields').notNull(),
    language: text('language', { enum: ['en', 'ar'] }).notNull(),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('library_letter_templates_unit_id').on(table.unitId)],
);
