import type { StatementLine } from '../../../../shared/treasury/statement';
import type { EntryType } from '../../../../shared/treasury/treasury-statuses';

/** The account's balance at the end of a day: every counted movement dated up to it. */
export async function balanceAtEndOf(
  db: D1Database,
  accountId: string,
  date: string,
): Promise<number> {
  const row = await db
    .prepare(
      'SELECT COALESCE(SUM(pence), 0) AS balance FROM treasury_movements WHERE account_id = ? AND entry_date <= ?',
    )
    .bind(accountId, date)
    .first<{ balance: number }>();
  return row?.balance ?? 0;
}

interface MovementRow {
  entryId: string;
  entryDate: string;
  type: EntryType;
  reversal: number;
  counterparty: string | null;
  description: string | null;
  otherAccountName: string | null;
  pence: number;
}

/** Brief 17 C2: the account's counted movements in a period, in order, without balances yet. */
export async function movementsIn(
  db: D1Database,
  params: { accountId: string; from: string; to: string },
): Promise<Omit<StatementLine, 'balancePence'>[]> {
  const result = await db
    .prepare(
      `SELECT m.entry_id AS entryId, m.entry_date AS entryDate, e.type, e.reverses_entry_id IS NOT NULL AS reversal,
         e.counterparty, e.description, o.name AS otherAccountName, m.pence
       FROM treasury_movements m
       JOIN treasury_entries e ON e.id = m.entry_id
       LEFT JOIN treasury_accounts o ON o.id = CASE WHEN e.account_id = m.account_id THEN e.to_account_id ELSE e.account_id END
         AND e.type = 'transfer'
       WHERE m.account_id = ? AND m.entry_date BETWEEN ? AND ?
       ORDER BY m.entry_date, e.created_at, e.rowid`,
    )
    .bind(params.accountId, params.from, params.to)
    .all<MovementRow>();
  return result.results.map(({ pence, reversal, ...row }) => ({
    ...row,
    reversal: reversal === 1,
    inPence: pence > 0 ? pence : 0,
    outPence: pence < 0 ? -pence : 0,
  }));
}
