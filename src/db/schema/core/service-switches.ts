import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 8.4: each service can be switched on or off portal-wide
// (scope = NATIONAL_SCOPE) or for a unit (scope = a unit id). No row for a
// (service, scope) pair means off (D-020) — except the three services that
// can never be switched off, which the application layer enforces by never
// reading this table for them at all.
export const serviceSwitches = sqliteTable(
  'service_switches',
  {
    service: text('service').notNull(),
    scope: text('scope').notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull(),
    updatedAt: text('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [primaryKey({ columns: [table.service, table.scope] })],
);
