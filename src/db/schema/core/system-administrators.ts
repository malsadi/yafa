import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from '../committee-register/people';

// Brief section 25 A1 (T-021): a plain list of person ids. Appoint/remove
// (15 A1) is Phase 1; this table exists now only so the request context
// (brief section 6.3) can resolve isSystemAdmin (T-038). No row is seeded
// this session — Phase 0 loads no seed data at all.
export const systemAdministrators = sqliteTable('system_administrators', {
  personId: text('person_id')
    .primaryKey()
    .references(() => people.id),
  createdAt: text('created_at').notNull(),
});
