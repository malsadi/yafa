import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { LANGUAGES } from '../../../shared/core/languages';

// Minimal columns only (D-003): enough for the Clerk webhook to link a
// person by email (brief section 6.2) and for the middleware to find a
// person by clerk_user_id. `language` is the officer's own choice (brief
// section 8.5), added for the Phase 0 frontend shell (T-067); nullable,
// since a person created before choosing has no saved language yet. Phase 1
// extends this table with a new migration (name, contact details, status —
// brief section 14 B1).
export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  clerkUserId: text('clerk_user_id').unique(),
  language: text('language', { enum: LANGUAGES }),
  createdAt: text('created_at').notNull(),
});
