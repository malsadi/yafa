import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 8.1: values are stored in D1 at national level
// (scope = NATIONAL_SCOPE), with per-unit overrides (scope = a unit id)
// where the setting's registration allows it.
export const settings = sqliteTable(
  'settings',
  {
    key: text('key').notNull(),
    scope: text('scope').notNull(),
    // JSON-encoded; validated against the setting's registered Zod schema
    // before writing (never trusted from the column alone).
    value: text('value').notNull(),
    updatedAt: text('updated_at').notNull(),
    updatedBy: text('updated_by').notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.scope] })],
);

// Append-only (brief section 9.1); a trigger blocks UPDATE and DELETE
// (migration 0002_immutability_triggers.sql). `previousValue` is null for a
// key's first-ever value at that scope.
export const settingsHistory = sqliteTable('settings_history', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  scope: text('scope').notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value').notNull(),
  changedAt: text('changed_at').notNull(),
  changedBy: text('changed_by').notNull(),
});
