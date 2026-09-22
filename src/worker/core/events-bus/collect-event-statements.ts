import { listEventHandlers } from './events-bus-registry';

/**
 * Runs every handler registered for `eventName` and flattens their
 * statements into one list, so the publisher can append them to its own
 * `db.batch()` call — brief section 10: "Where the reaction must be
 * consistent with the trigger, it runs in the same D1 batch." D1's batch
 * is one implicit transaction: if any statement in it fails, the whole
 * batch rolls back, so a broken subscriber can't record only half of the
 * change (proved in `tests/core/events-bus`, not just asserted here).
 *
 * Queue-routed effects (brief section 10.1: notifications) are a separate
 * path — a service enqueues those itself; they never go through this
 * function, since nothing about a Queue message can be part of a D1 batch.
 */
export async function collectEventStatements(
  db: D1Database,
  eventName: string,
  payload: unknown,
): Promise<D1PreparedStatement[]> {
  const handlers = listEventHandlers(eventName);
  const statementLists = await Promise.all(handlers.map(async (handler) => handler(db, payload)));
  return statementLists.flat();
}
