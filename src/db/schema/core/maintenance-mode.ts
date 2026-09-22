import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 25 D6: whole-portal read-only state with a banner, not a
// setting (T-054: nothing in brief section 25's settings list names it, and
// an unset setting means "not configured, action waits" — the wrong
// behaviour for a flag that must default to off). Modelled like
// service_switches: one row, audited, off until switched on. `key` is
// always MAINTENANCE_MODE_KEY — there is exactly one row, ever.
export const maintenanceMode = sqliteTable('maintenance_mode', {
  key: text('key').primaryKey(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by').notNull(),
});
