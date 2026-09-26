import { generateId } from '../../../core/ids';

/** Brief 17 A2: an open event account, belonging to one event. */
export function buildOpenEventAccountStatement(
  db: D1Database,
  row: { id: string; unitId: string; eventId: string; name: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO treasury_accounts (id, unit_id, kind, name, branch_type, event_id, status, opened_by, opened_at, closed_by, closed_at)
       VALUES (?, ?, 'event', ?, NULL, ?, 'Open', ?, ?, NULL, NULL)`,
    )
    .bind(row.id, row.unitId, row.name, row.eventId, row.actor, row.at);
}

/** P10 and D-131: one budget line of an event account. */
export function buildBudgetLineStatement(
  db: D1Database,
  row: { accountId: string; unitId: string; name: string; amountPence: number; position: number },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO treasury_budget_lines (id, account_id, unit_id, name, amount_pence, position) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(generateId(), row.accountId, row.unitId, row.name, row.amountPence, row.position);
}

/**
 * P8 and D-131: the event-close transfer, worked out in SQL when the batch
 * runs (build rule 6) — a positive balance goes back to the branch account;
 * a negative one is brought to zero from it. At zero, nothing moves. It
 * needs no approval.
 */
export function buildClosingTransferStatements(
  db: D1Database,
  row: {
    eventAccountId: string;
    branchAccountId: string;
    unitId: string;
    date: string;
    description: string | null;
    actor: string;
    at: string;
  },
): D1PreparedStatement[] {
  const insert = (from: string, to: string, sign: '>' | '<', ids: string) =>
    db
      .prepare(
        `INSERT INTO treasury_entries (id, unit_id, type, account_id, to_account_id, amount_pence, entry_date,
           counterparty, description, budget_line_id, approval_status, reverses_entry_id, created_by, created_at)
         SELECT ?, ?, 'transfer', ?, ?, ABS(balance), ?, NULL, ?, NULL, 'Not needed', NULL, ?, ?
         FROM (SELECT COALESCE(SUM(pence), 0) AS balance FROM treasury_movements WHERE account_id = ?)
         WHERE balance ${sign} 0`,
      )
      .bind(
        ids,
        row.unitId,
        from,
        to,
        row.date,
        row.description,
        row.actor,
        row.at,
        row.eventAccountId,
      );
  return [
    insert(row.eventAccountId, row.branchAccountId, '>', generateId()),
    insert(row.branchAccountId, row.eventAccountId, '<', generateId()),
  ];
}
