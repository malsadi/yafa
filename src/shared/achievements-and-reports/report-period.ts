import { financialYearStartingIn, type DayAndMonth } from '../treasury/financial-year';

/** D-215 (O-154): a report year's first and last days, `YYYY-MM-DD`. */
export interface ReportPeriod {
  start: string;
  end: string;
}

/** The "2026" report covers the 12 months from the administrator's start day in 2026. */
export function reportPeriodOf(year: number, start: DayAndMonth): ReportPeriod {
  return financialYearStartingIn(year, start);
}
