import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { LISTS } from '../../../shared/administration-panel/lists';

// Brief 8.2 and 25 B3 (T-088): one row per item of one of the lists the
// data administrator manages, named in English and Arabic like roles and
// branches (D-052, D-054). They start empty; no row is created by code.
export const listItems = sqliteTable('list_items', {
  id: text('id').primaryKey(),
  list: text('list', { enum: LISTS }).notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  // D-071: the administrator's order; D-070: retired, never deleted;
  // D-076: a calendar colour's own value.
  position: integer('position').notNull(),
  retiredAt: text('retired_at'),
  colour: text('colour'),
  createdAt: text('created_at').notNull(),
});
