import type { StatementData } from '../../../../shared/treasury/statement';
import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import type { AccountRecord } from '../../../../shared/treasury/treasury-records';
import { balanceAtEndOf, movementsIn } from './statements.repo';

/** Brief 17 C2 and D-128: an account's statement for a period, balances derived from its entries. */
export async function buildStatementData(
  db: D1Database,
  account: Pick<AccountRecord, 'id' | 'name'>,
  period: { from: string; to: string },
): Promise<StatementData> {
  const openingBalancePence = await balanceAtEndOf(db, account.id, addDaysToDate(period.from, -1));
  let balance = openingBalancePence;
  const lines = (await movementsIn(db, { accountId: account.id, ...period })).map((line) => {
    balance += line.inPence - line.outPence;
    return { ...line, balancePence: balance };
  });
  return {
    accountId: account.id,
    accountName: account.name,
    ...period,
    openingBalancePence,
    lines,
    closingBalancePence: balance,
  };
}
