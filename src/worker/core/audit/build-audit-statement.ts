import { generateId } from '../ids';

export interface AuditEntryInput {
  actorPersonId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Builds (but does not execute) the INSERT for one audit_log row, so the
 * caller adds it to their own D1 batch alongside the write it records
 * (brief section 9.2).
 */
export function buildAuditStatement(db: D1Database, entry: AuditEntryInput): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO audit_log (id, actor_person_id, action, entity_type, entity_id, occurred_at, before, after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      entry.actorPersonId,
      entry.action,
      entry.entityType,
      entry.entityId,
      new Date().toISOString(),
      entry.before === undefined ? null : JSON.stringify(entry.before),
      entry.after === undefined ? null : JSON.stringify(entry.after),
    );
}
