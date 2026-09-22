import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Minimal columns only (D-003): enough for the Clerk middleware, the
// webhook and can() to resolve a unit. Phase 1 extends this table with a
// new migration (area, status, letterhead address, calendar colour — brief
// section 25 B1).
export const units = sqliteTable('units', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['national', 'branch'] }).notNull(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});
