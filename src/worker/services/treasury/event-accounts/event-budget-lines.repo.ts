import { generateId } from '../../../core/ids';

const EVENT_ACCOUNT = "(SELECT id FROM treasury_accounts WHERE event_id = ? AND kind = 'event')";

/**
 * D-176 and D-187: an event's budget lines change only while the event is
 * in Draft; a line is removed only if no entry is tagged to it. The
 * database refuses anything else. Statements for the Event organiser's batch.
 */
export function buildAddEventBudgetLineStatement(
  db: D1Database,
  row: { eventId: string; name: string; amountPence: number },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO treasury_budget_lines (id, account_id, unit_id, name, amount_pence, position)
       SELECT ?, a.id, a.unit_id, ?, ?, COALESCE((SELECT MAX(b.position) FROM treasury_budget_lines b WHERE b.account_id = a.id), 0) + 1
       FROM treasury_accounts a WHERE a.id = ${EVENT_ACCOUNT}`,
    )
    .bind(generateId(), row.name, row.amountPence, row.eventId);
}

export function buildChangeEventBudgetLineStatement(
  db: D1Database,
  row: { eventId: string; lineId: string; name: string; amountPence: number },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE treasury_budget_lines SET name = ?, amount_pence = ? WHERE id = ? AND account_id = ${EVENT_ACCOUNT}`,
    )
    .bind(row.name, row.amountPence, row.lineId, row.eventId);
}

export function buildRemoveEventBudgetLineStatement(
  db: D1Database,
  row: { eventId: string; lineId: string },
): D1PreparedStatement {
  return db
    .prepare(`DELETE FROM treasury_budget_lines WHERE id = ? AND account_id = ${EVENT_ACCOUNT}`)
    .bind(row.lineId, row.eventId);
}

/** D-188: an open event account's name follows its event's name. */
export function buildRenameEventAccountStatement(
  db: D1Database,
  row: { eventId: string; name: string },
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE treasury_accounts SET name = ? WHERE event_id = ? AND kind = 'event' AND status = 'Open'",
    )
    .bind(row.name, row.eventId);
}

/** Whether this line is one of the event's own, and whether an entry is tagged to it. */
export async function findEventBudgetLine(
  db: D1Database,
  params: { eventId: string; lineId: string },
): Promise<{ id: string; tagged: number } | null> {
  return db
    .prepare(
      `SELECT b.id, (SELECT COUNT(*) FROM treasury_entries e WHERE e.budget_line_id = b.id) AS tagged
       FROM treasury_budget_lines b WHERE b.id = ? AND b.account_id = ${EVENT_ACCOUNT}`,
    )
    .bind(params.lineId, params.eventId)
    .first();
}
