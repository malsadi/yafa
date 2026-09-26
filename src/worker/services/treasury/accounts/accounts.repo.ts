import type { AccountRecord } from '../../../../shared/treasury/treasury-records';
import { generateId } from '../../../core/ids';

const SELECT = `SELECT a.id, a.unit_id AS unitId, a.kind, a.name, a.branch_type AS branchType,
    a.event_id AS eventId, a.status, a.opened_at AS openedAt, a.closed_at AS closedAt,
    COALESCE((SELECT MIN(e.entry_date) FROM treasury_entries e WHERE e.account_id = a.id OR e.to_account_id = a.id),
      date(a.opened_at)) AS openedOn,
    (SELECT COALESCE(SUM(m.pence), 0) FROM treasury_movements m WHERE m.account_id = a.id) AS balancePence,
    (SELECT COUNT(*) FROM treasury_entries e WHERE e.approval_status = 'Awaiting approval'
      AND (e.account_id = a.id OR e.to_account_id = a.id)) AS awaitingCount
  FROM treasury_accounts a`;

/** Brief 17 C1: the unit's accounts, balances derived from their entries — branch first, open first. */
export async function listAccountsOf(db: D1Database, unitId: string): Promise<AccountRecord[]> {
  const result = await db
    .prepare(`${SELECT} WHERE a.unit_id = ? ORDER BY a.kind, a.status DESC, a.name`)
    .bind(unitId)
    .all<AccountRecord>();
  return result.results;
}

export async function findAccount(
  db: D1Database,
  accountId: string,
): Promise<AccountRecord | null> {
  return db.prepare(`${SELECT} WHERE a.id = ?`).bind(accountId).first<AccountRecord>();
}

/** Brief 17 A1: a new open branch account. */
export function buildOpenBranchAccountStatement(
  db: D1Database,
  row: { id: string; unitId: string; name: string; branchType: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO treasury_accounts (id, unit_id, kind, name, branch_type, event_id, status, opened_by, opened_at, closed_by, closed_at)
       VALUES (?, ?, 'branch', ?, ?, NULL, 'Open', ?, ?, NULL, NULL)`,
    )
    .bind(row.id, row.unitId, row.name, row.branchType, row.actor, row.at);
}

/** P6: the account's opening balance, an entry needing no receipt or approval. */
export function buildOpeningBalanceStatement(
  db: D1Database,
  row: {
    accountId: string;
    unitId: string;
    pence: number;
    date: string;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO treasury_entries (id, unit_id, type, account_id, to_account_id, amount_pence, entry_date,
         counterparty, description, budget_line_id, approval_status, reverses_entry_id, created_by, created_at)
       VALUES (?, ?, 'opening-balance', ?, NULL, ?, ?, NULL, NULL, NULL, 'Not needed', NULL, ?, ?)`,
    )
    .bind(generateId(), row.unitId, row.accountId, row.pence, row.date, row.actor, row.at);
}

/** D-118: close an open account; a trigger refuses unless it is at zero with nothing awaiting. */
export function buildCloseAccountStatement(
  db: D1Database,
  row: { accountId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      "UPDATE treasury_accounts SET status = 'Closed', closed_by = ?, closed_at = ? WHERE id = ?",
    )
    .bind(row.actor, row.at, row.accountId);
}
