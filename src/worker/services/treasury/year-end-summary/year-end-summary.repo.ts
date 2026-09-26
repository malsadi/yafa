import type { YearFigures } from '../../../../shared/treasury/treasury-records';

type InYear = Omit<YearFigures, 'startBalancePence' | 'endBalancePence'>;

/** D-130: an account's counted entries in a year, by what they were. */
export async function figuresInYear(
  db: D1Database,
  params: { accountId: string; start: string; end: string },
): Promise<InYear> {
  const row = await db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'opening-balance' AND account_id = ?1 THEN amount_pence END), 0) AS openingBalancesPence,
         COALESCE(SUM(CASE WHEN type = 'credit' AND account_id = ?1 THEN amount_pence END), 0) AS creditsPence,
         COALESCE(SUM(CASE WHEN type = 'debit' AND account_id = ?1 THEN amount_pence END), 0) AS debitsPence,
         COALESCE(SUM(CASE WHEN type = 'transfer' AND to_account_id = ?1 THEN amount_pence END), 0) AS transfersInPence,
         COALESCE(SUM(CASE WHEN type = 'transfer' AND account_id = ?1 THEN amount_pence END), 0) AS transfersOutPence
       FROM treasury_entries
       WHERE (account_id = ?1 OR to_account_id = ?1) AND entry_date BETWEEN ?2 AND ?3
         AND approval_status IN ('Not needed', 'Approved')`,
    )
    .bind(params.accountId, params.start, params.end)
    .first<InYear>();
  return (
    row ?? {
      openingBalancesPence: 0,
      creditsPence: 0,
      debitsPence: 0,
      transfersInPence: 0,
      transfersOutPence: 0,
    }
  );
}
