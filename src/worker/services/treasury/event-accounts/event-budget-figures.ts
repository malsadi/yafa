import type { EventBudgetFigures } from '../../../../shared/treasury/treasury-records';

interface MovementRow {
  type: 'opening-balance' | 'credit' | 'debit' | 'transfer';
  accountId: string;
  amountPence: number;
  budgetLineId: string | null;
  reversal: number;
}

/**
 * P10 and D-183: which column an entry counts in. Money in is income and
 * money out is spending; a reversal (B6) takes its original's amount back
 * off the original's column, rather than counting as new money.
 */
function columnOf(
  row: MovementRow,
  accountId: string,
): { column: 'income' | 'spending'; pence: number } {
  const moneyIn = row.type === 'credit' || (row.type === 'transfer' && row.accountId !== accountId);
  if (row.reversal === 0)
    return { column: moneyIn ? 'income' : 'spending', pence: row.amountPence };
  return { column: moneyIn ? 'spending' : 'income', pence: -row.amountPence };
}

/** Income and spending per budget line — null for untagged amounts, "Unallocated". */
function sumByLine(rows: MovementRow[], accountId: string) {
  const byLine = new Map<string | null, { incomePence: number; spendingPence: number }>();
  for (const row of rows) {
    const { column, pence } = columnOf(row, accountId);
    const sums = byLine.get(row.budgetLineId) ?? { incomePence: 0, spendingPence: 0 };
    sums[column === 'income' ? 'incomePence' : 'spendingPence'] += pence;
    byLine.set(row.budgetLineId, sums);
  }
  return byLine;
}

/**
 * Brief 21 C1, P10 and D-183: an event account's budget lines, each with its
 * budget and the counted income and spending tagged to it, the untagged
 * amounts as "Unallocated", the totals and the balance — in pence.
 */
export async function eventBudgetFigures(
  db: D1Database,
  eventId: string,
): Promise<EventBudgetFigures> {
  const account = await db
    .prepare("SELECT id FROM treasury_accounts WHERE event_id = ? AND kind = 'event'")
    .bind(eventId)
    .first<{ id: string }>();
  const accountId = account?.id ?? '';
  const [lines, movements] = await db.batch([
    db
      .prepare(
        'SELECT id, name, amount_pence AS budgetPence FROM treasury_budget_lines WHERE account_id = ? ORDER BY position',
      )
      .bind(accountId),
    db
      .prepare(
        `SELECT type, account_id AS accountId, amount_pence AS amountPence, budget_line_id AS budgetLineId,
           reverses_entry_id IS NOT NULL AS reversal
         FROM treasury_entries WHERE (account_id = ?1 OR to_account_id = ?1)
           AND approval_status IN ('Not needed', 'Approved')`,
      )
      .bind(accountId),
  ]);
  const byLine = sumByLine((movements?.results ?? []) as MovementRow[], accountId);
  const budgetLines = (lines?.results ?? []) as { id: string; name: string; budgetPence: number }[];
  const figures = budgetLines.map((line) => ({
    name: line.name,
    budgetPence: line.budgetPence,
    ...(byLine.get(line.id) ?? { incomePence: 0, spendingPence: 0 }),
  }));
  const unallocated = byLine.get(null) ?? { incomePence: 0, spendingPence: 0 };
  const sum = (key: 'budgetPence' | 'incomePence' | 'spendingPence') =>
    figures.reduce((total, line) => total + line[key], 0) +
    (key === 'budgetPence' ? 0 : unallocated[key]);
  const totals = {
    budgetPence: sum('budgetPence'),
    incomePence: sum('incomePence'),
    spendingPence: sum('spendingPence'),
  };
  return {
    lines: figures,
    unallocated,
    totals,
    balancePence: totals.incomePence - totals.spendingPence,
  };
}
