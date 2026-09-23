import { generateId } from '../ids';

export interface InPortalNotificationInput {
  personId: string;
  /** A code, never prose (T-018) — e.g. `'task.reminder'`, `'communication-hub.circular'`. */
  kind: string;
  /** JSON-serializable parameters the web app interpolates into the kind's localized text. */
  params?: unknown;
}

/**
 * Builds (but does not execute) the INSERT for one in-portal notification,
 * so the caller adds it to their own D1 batch — the same shape as
 * `buildAuditStatement` (brief section 9.5's inbox, shared by the
 * Communication hub and the Task tracker). Deliberately separate from
 * anything push-related (`core/push`): brief section 10.2 — "Task
 * reminders are in-portal only, never phone push" — needs that separation
 * to be structural, not a convention a caller could forget.
 */
export function buildInPortalNotificationStatement(
  db: D1Database,
  input: InPortalNotificationInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO notifications (id, person_id, kind, params_json, read_at, created_at)
       VALUES (?, ?, ?, ?, NULL, ?)`,
    )
    .bind(
      generateId(),
      input.personId,
      input.kind,
      input.params === undefined ? null : JSON.stringify(input.params),
      new Date().toISOString(),
    );
}
