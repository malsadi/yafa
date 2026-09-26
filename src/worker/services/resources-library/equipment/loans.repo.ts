import type {
  LoanChange,
  LoanHistoryEntry,
  LoanRecord,
} from '../../../../shared/resources-library/equipment';
import { generateId } from '../../../core/ids';
import type { LoanDetailsInput } from './equipment.schema';

type LoanRow = Omit<LoanRecord, 'history'> & { unitId: string };

const LOAN = `SELECT id, equipment_id AS equipmentId, unit_id AS unitId, borrower, quantity,
  borrowed_on AS borrowedOn, due_back AS dueBack, returned_on AS returnedOn, version
  FROM library_equipment_loans`;

export async function findLoan(db: D1Database, loanId: string): Promise<LoanRow | null> {
  return db.prepare(`${LOAN} WHERE id = ?`).bind(loanId).first<LoanRow>();
}

/** D-108: how many of an item are out on loan now, leaving out one loan being corrected. */
export async function outOnLoan(
  db: D1Database,
  equipmentId: string,
  exceptLoanId = '',
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COALESCE(SUM(quantity), 0) AS out FROM library_equipment_loans
       WHERE equipment_id = ? AND returned_on IS NULL AND id <> ?`,
    )
    .bind(equipmentId, exceptLoanId)
    .first<{ out: number }>();
  return row?.out ?? 0;
}

/** The loans of these items, open ones first, each with its history in order (D-109). */
export async function listLoansOf(db: D1Database, equipmentIds: string[]): Promise<LoanRecord[]> {
  if (equipmentIds.length === 0) return [];
  const marks = equipmentIds.map(() => '?').join(', ');
  const loans = await db
    .prepare(`${LOAN} WHERE equipment_id IN (${marks}) ORDER BY returned_on IS NOT NULL, due_back`)
    .bind(...equipmentIds)
    .all<LoanRow>();
  const history = await db
    .prepare(
      `SELECT h.loan_id AS loanId, h.change, h.borrower, h.quantity, h.borrowed_on AS borrowedOn,
         h.due_back AS dueBack, h.returned_on AS returnedOn, p.name AS recordedByName, h.recorded_at AS recordedAt
       FROM library_equipment_loan_history h LEFT JOIN people p ON p.id = h.recorded_by
       JOIN library_equipment_loans l ON l.id = h.loan_id
       WHERE l.equipment_id IN (${marks}) ORDER BY h.recorded_at, h.rowid`,
    )
    .bind(...equipmentIds)
    .all<LoanHistoryEntry & { loanId: string }>();
  const entries = (loanId: string): LoanHistoryEntry[] =>
    history.results
      .filter((h) => h.loanId === loanId)
      .map((h) => ({
        change: h.change,
        borrower: h.borrower,
        quantity: h.quantity,
        borrowedOn: h.borrowedOn,
        dueBack: h.dueBack,
        returnedOn: h.returnedOn,
        recordedByName: h.recordedByName,
        recordedAt: h.recordedAt,
      }));
  return loans.results.map((loan) => ({
    id: loan.id,
    equipmentId: loan.equipmentId,
    borrower: loan.borrower,
    quantity: loan.quantity,
    borrowedOn: loan.borrowedOn,
    dueBack: loan.dueBack,
    returnedOn: loan.returnedOn,
    version: loan.version,
    history: entries(loan.id),
  }));
}

export function buildInsertLoanStatement(
  db: D1Database,
  row: LoanDetailsInput & {
    id: string;
    equipmentId: string;
    unitId: string;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_equipment_loans (id, equipment_id, unit_id, borrower, quantity, borrowed_on,
         due_back, returned_on, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.equipmentId,
      row.unitId,
      row.borrower,
      row.quantity,
      row.borrowedOn,
      row.dueBack,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** D-109: a correction, or the return, from `version` (9.1). */
export function buildUpdateLoanStatement(
  db: D1Database,
  change: LoanDetailsInput & {
    id: string;
    returnedOn: string | null;
    version: number;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE library_equipment_loans SET borrower = ?, quantity = ?, borrowed_on = ?, due_back = ?,
         returned_on = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      change.borrower,
      change.quantity,
      change.borrowedOn,
      change.dueBack,
      change.returnedOn,
      change.version + 1,
      change.actor,
      change.at,
      change.id,
    );
}

/** D-109: the loan's state after a change, kept in its history. */
export function buildLoanHistoryStatement(
  db: D1Database,
  row: LoanDetailsInput & {
    loanId: string;
    unitId: string;
    change: LoanChange;
    returnedOn: string | null;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_equipment_loan_history (id, loan_id, unit_id, change, borrower, quantity,
         borrowed_on, due_back, returned_on, recorded_by, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      generateId(),
      row.loanId,
      row.unitId,
      row.change,
      row.borrower,
      row.quantity,
      row.borrowedOn,
      row.dueBack,
      row.returnedOn,
      row.actor,
      row.at,
    );
}
