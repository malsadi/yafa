import { addDaysToDate } from '../core/add-days-to-date';

/** D-128: the financial year's first day, as a day of a month (such as 1 April). */
export interface DayAndMonth {
  month: number;
  day: number;
}

/** A day that every year has — never 29 February, which would move. */
export function isFixedDayOfYear({ month, day }: DayAndMonth): boolean {
  const date = new Date(Date.UTC(2001, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A financial year: its first and last days, `YYYY-MM-DD`. */
export interface FinancialYear {
  start: string;
  end: string;
}

/** The financial year starting on `start` in the calendar year `year`. */
export function financialYearStartingIn(year: number, start: DayAndMonth): FinancialYear {
  const first = `${String(year)}-${pad(start.month)}-${pad(start.day)}`;
  const next = `${String(year + 1)}-${pad(start.month)}-${pad(start.day)}`;
  return { start: first, end: addDaysToDate(next, -1) };
}

/** The financial year a date (`YYYY-MM-DD`) falls in. */
export function financialYearOf(date: string, start: DayAndMonth): FinancialYear {
  const year = Number(date.slice(0, 4));
  const thisYears = financialYearStartingIn(year, start);
  return date >= thisYears.start ? thisYears : financialYearStartingIn(year - 1, start);
}
