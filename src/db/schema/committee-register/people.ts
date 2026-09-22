import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Minimal columns only (D-003): enough for the Clerk webhook to link a
// person by email (brief section 6.2) and for the middleware to find a
// person by clerk_user_id. Phase 1 extends this table with a new migration
// (name, contact details, language, status — brief section 14 B1).
export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  clerkUserId: text('clerk_user_id').unique(),
  createdAt: text('created_at').notNull(),
});
