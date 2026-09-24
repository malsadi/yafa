import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 8.2 and 13 A3: the six archive categories are fixed by the brief,
// created by a migration (0018) as locked data, and never changed or
// deleted (a trigger). Shown read-only in the Administration panel (25 B3).
export const archiveCategories = sqliteTable('archive_categories', {
  id: text('id').primaryKey(),
  position: integer('position').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
});
