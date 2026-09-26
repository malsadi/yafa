import type { EntryType } from '../../../../shared/treasury/treasury-statuses';
import type { ApprovalStatus } from '../../../../shared/treasury/treasury-statuses';

export interface EntryRow {
  id: string;
  unitId: string;
  type: EntryType;
  accountId: string;
  toAccountId: string | null;
  amountPence: number;
  entryDate: string;
  counterparty: string | null;
  description: string | null;
  budgetLineId: string | null;
  approvalStatus: ApprovalStatus;
  reversesEntryId: string | null;
  createdBy: string;
}

/** Brief 17 B: one new entry — never changed afterwards, save by its one approval decision. */
export function buildInsertEntryStatement(
  db: D1Database,
  row: EntryRow & { at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO treasury_entries (id, unit_id, type, account_id, to_account_id, amount_pence, entry_date,
         counterparty, description, budget_line_id, approval_status, reverses_entry_id, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.type,
      row.accountId,
      row.toAccountId,
      row.amountPence,
      row.entryDate,
      row.counterparty,
      row.description,
      row.budgetLineId,
      row.approvalStatus,
      row.reversesEntryId,
      row.createdBy,
      row.at,
    );
}

const COLUMNS = `id, unit_id AS unitId, type, account_id AS accountId, to_account_id AS toAccountId,
  amount_pence AS amountPence, entry_date AS entryDate, counterparty, description,
  budget_line_id AS budgetLineId, approval_status AS approvalStatus,
  reverses_entry_id AS reversesEntryId, created_by AS createdBy`;

export async function findEntry(db: D1Database, entryId: string): Promise<EntryRow | null> {
  return db
    .prepare(`SELECT ${COLUMNS} FROM treasury_entries WHERE id = ?`)
    .bind(entryId)
    .first<EntryRow>();
}
