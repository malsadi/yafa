import type { EntryRecord } from '../../../../shared/treasury/treasury-records';

type AwaitingRow = Omit<EntryRecord, 'receipts'>;

/** P7 and D-133: the unit's debits and transfers awaiting a second officer, oldest first. */
export async function listAwaiting(db: D1Database, unitId: string): Promise<AwaitingRow[]> {
  const result = await db
    .prepare(
      `SELECT e.id, e.type, e.account_id AS accountId, e.to_account_id AS toAccountId,
         e.amount_pence AS amountPence, e.entry_date AS entryDate, e.counterparty, e.description,
         e.budget_line_id AS budgetLineId, e.approval_status AS approvalStatus,
         e.reverses_entry_id AS reversesEntryId, NULL AS reversedByEntryId,
         e.created_by AS createdBy, c.name AS createdByName, e.created_at AS createdAt,
         NULL AS decidedByName, NULL AS decidedAt, NULL AS declineReason
       FROM treasury_entries e LEFT JOIN people c ON c.id = e.created_by
       WHERE e.unit_id = ? AND e.approval_status = 'Awaiting approval'
       ORDER BY e.created_at, e.rowid`,
    )
    .bind(unitId)
    .all<AwaitingRow>();
  return result.results;
}

/** P7: the one decision an entry awaiting approval takes; the triggers refuse any other change. */
export function buildDecisionStatement(
  db: D1Database,
  row: {
    entryId: string;
    decision: 'Approved' | 'Declined';
    actor: string;
    at: string;
    reason: string | null;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE treasury_entries SET approval_status = ?, decided_by = ?, decided_at = ?, decline_reason = ?
       WHERE id = ? AND approval_status = 'Awaiting approval'`,
    )
    .bind(row.decision, row.actor, row.at, row.reason, row.entryId);
}
