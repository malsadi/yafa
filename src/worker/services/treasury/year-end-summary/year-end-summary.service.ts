import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { financialYearStartingIn } from '../../../../shared/treasury/financial-year';
import type { YearEndSummary, YearFigures } from '../../../../shared/treasury/treasury-records';
import { getTodayInLondon } from '../../../core/permissions';
import { listAccountsOf } from '../accounts/accounts.repo';
import { balanceAtEndOf } from '../statements/statements.repo';
import { financialYearStart } from '../treasury-settings';
import { listClosedYears } from '../year-end-close/year-end-close.repo';
import { figuresInYear } from './year-end-summary.repo';

const ZERO: YearFigures = {
  startBalancePence: 0,
  openingBalancesPence: 0,
  creditsPence: 0,
  debitsPence: 0,
  transfersInPence: 0,
  transfersOutPence: 0,
  endBalancePence: 0,
};
const dateOf = (timestamp: string) => getTodayInLondon(new Date(timestamp));

/**
 * Brief 17 build notes and D-130: the unit's Treasury for the financial
 * year starting in `year` — for each account open at some point in it, its
 * balance at the start, what came in and went out by kind, and its balance
 * at the end; the unit's totals; and whether the year is closed. For the
 * annual report (Phase 11), which checks its own permission.
 */
export async function yearEndSummary(
  db: D1Database,
  unitId: string,
  year: number,
): Promise<YearEndSummary> {
  const { start, end } = financialYearStartingIn(year, await financialYearStart(db, unitId));
  const accounts = (await listAccountsOf(db, unitId)).filter(
    (a) => a.openedOn <= end && (a.closedAt === null || dateOf(a.closedAt) >= start),
  );
  const rows = await Promise.all(
    accounts.map(async (a) => ({
      accountId: a.id,
      name: a.name,
      kind: a.kind,
      startBalancePence: await balanceAtEndOf(db, a.id, addDaysToDate(start, -1)),
      ...(await figuresInYear(db, { accountId: a.id, start, end })),
      endBalancePence: await balanceAtEndOf(db, a.id, end),
    })),
  );
  const keys = Object.keys(ZERO) as (keyof YearFigures)[];
  const totals = rows.reduce<YearFigures>(
    (sum, row) => ({ ...sum, ...Object.fromEntries(keys.map((k) => [k, sum[k] + row[k]])) }),
    ZERO,
  );
  const closed = (await listClosedYears(db, unitId)).some((y) => y.start === start);
  return { start, end, closed, accounts: rows, totals };
}
