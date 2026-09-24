import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { LANGUAGES } from '../../../shared/core/languages';

// A person in the register (brief 14 B1): name as they write it (brief
// 8.5), email and phone (D-053), and the Clerk link by email (brief 6.2).
// `language` is the officer's own choice (brief 8.5, T-067), null until
// chosen. Current or past is derived from their terms (D-019), not stored.
export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  clerkUserId: text('clerk_user_id').unique(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  language: text('language', { enum: LANGUAGES }),
  createdAt: text('created_at').notNull(),
});
