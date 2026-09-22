import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { units } from './units';

// Minimal columns only (D-003): enough for terms to reference a role and for
// can() to resolve its grants. unitId is null for a standard (national)
// role available to every branch, and a real unit id for a branch's own
// extra role (brief section 14 B2). Designation as the branch/national
// register officer role (brief section 7.2, 15 B2) is Phase 1.
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  unitId: text('unit_id').references(() => units.id),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull(),
});
