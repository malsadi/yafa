/**
 * A reaction to an event (brief section 10): given the db and the event's
 * payload, returns the prepared statements that record its effect. Never
 * executes them itself — the publisher adds them to its own `db.batch()`
 * call, so the trigger and every same-batch reaction commit or roll back
 * together. Anything the statement needs from current data belongs in its
 * own SQL (brief section 9.1), not read-then-written here.
 */
export type EventHandler = (
  db: D1Database,
  payload: unknown,
) => D1PreparedStatement[] | Promise<D1PreparedStatement[]>;
