import type { EntryRecord } from '../../../../shared/treasury/treasury-records';

type EntryHistoryRow = Omit<EntryRecord, 'receipts'>;

/**
 * Brief 17 B: every entry touching an account — as the account it comes
 * from or, for a transfer, goes to — in a period, oldest first, with who
 * entered and decided it and what reverses it.
 */
export async function listEntriesOfAccount(
  db: D1Database,
  params: { accountId: string; from?: string; to?: string },
): Promise<EntryHistoryRow[]> {
  const result = await db
    .prepare(
      `SELECT e.id, e.type, e.account_id AS accountId, e.to_account_id AS toAccountId,
         e.amount_pence AS amountPence, e.entry_date AS entryDate, e.counterparty, e.description,
         e.budget_line_id AS budgetLineId, e.approval_status AS approvalStatus,
         e.reverses_entry_id AS reversesEntryId,
         (SELECT r.id FROM treasury_entries r WHERE r.reverses_entry_id = e.id) AS reversedByEntryId,
         e.created_by AS createdBy, c.name AS createdByName, e.created_at AS createdAt,
         d.name AS decidedByName, e.decided_at AS decidedAt, e.decline_reason AS declineReason
       FROM treasury_entries e
       LEFT JOIN people c ON c.id = e.created_by
       LEFT JOIN people d ON d.id = e.decided_by
       WHERE (e.account_id = ?1 OR e.to_account_id = ?1)
         AND e.entry_date >= ?2 AND e.entry_date <= ?3
       ORDER BY e.entry_date, e.created_at, e.rowid`,
    )
    .bind(params.accountId, params.from ?? '0000-01-01', params.to ?? '9999-12-31')
    .all<EntryHistoryRow>();
  return result.results;
}
