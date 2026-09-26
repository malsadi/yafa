import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 16 A1 to A3, D-103, D-104 and D-100: a template or guide — a file
// with a title, an optional description and the file's language. The
// General Council's are shared with every branch. Replacing the file keeps
// the old one, no longer shown; retired and brought back, never deleted.
export const resources = sqliteTable(
  'library_resources',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id').notNull(),
    kind: text('kind', { enum: ['template', 'guide'] }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    language: text('language', { enum: ['en', 'ar'] }).notNull(),
    fileId: text('file_id').notNull(),
    retiredAt: text('retired_at'),
    version: integer('version').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
    updatedBy: text('updated_by').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('library_resources_unit_id').on(table.unitId)],
);
