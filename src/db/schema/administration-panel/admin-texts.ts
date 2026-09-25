import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ADMIN_TEXT_KEYS } from '../../../shared/administration-panel/admin-texts';

// Brief 8.5, 25 C4 and C5: one row per text the data administrator writes,
// in English and Arabic (D-022: the Arabic may be missing, and English shows
// until it is written). No row until written: nothing is written by code.
export const adminTexts = sqliteTable('admin_texts', {
  key: text('key', { enum: ADMIN_TEXT_KEYS }).primaryKey(),
  textEn: text('text_en').notNull(),
  textAr: text('text_ar'),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by').notNull(),
});
