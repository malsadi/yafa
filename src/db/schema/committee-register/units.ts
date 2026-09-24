import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief 14 A1 and 25 B1: a branch's name (in English and Arabic, D-054),
// code, area and status (active or inactive, P4). The General Council is
// the one `national` unit and has no area. Letterhead address and calendar
// colour (25 B1) are added by the step that settles their form (T-080).
export const units = sqliteTable('units', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['national', 'branch'] }).notNull(),
  code: text('code').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  area: text('area'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull(),
  createdAt: text('created_at').notNull(),
});
