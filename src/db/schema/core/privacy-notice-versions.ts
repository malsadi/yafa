import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 13/15 C5, D-005/T-020: the privacy notice, English and
// Arabic together, stored append-only — an acknowledgement records which
// version the officer saw, so an edited-in-place notice would silently
// invalidate that record. The current version is the most recently
// inserted row; no separate "is_current" flag to go stale.
export const privacyNoticeVersions = sqliteTable('privacy_notice_versions', {
  id: text('id').primaryKey(),
  textEn: text('text_en').notNull(),
  textAr: text('text_ar'),
  createdAt: text('created_at').notNull(),
});
