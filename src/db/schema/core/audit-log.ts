import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Brief section 9.2: one append-only table; a trigger blocks UPDATE and
// DELETE (migration 0002_immutability_triggers.sql). `before`/`after` are
// JSON-encoded, recorded only where useful for the action.
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  actorPersonId: text('actor_person_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  occurredAt: text('occurred_at').notNull(),
  before: text('before'),
  after: text('after'),
});
