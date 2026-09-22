import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { people } from './people';
import { roles } from './roles';
import { units } from './units';

// Minimal columns only (D-003). No status column: D-019 derives "Current"
// vs "Past officer" from endDate at query time, never stored. Phase 1
// extends this table with a new migration (brief section 14 B3's full
// election/handover lifecycle).
export const terms = sqliteTable('terms', {
  id: text('id').primaryKey(),
  personId: text('person_id')
    .notNull()
    .references(() => people.id),
  roleId: text('role_id')
    .notNull()
    .references(() => roles.id),
  unitId: text('unit_id')
    .notNull()
    .references(() => units.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull(),
});
