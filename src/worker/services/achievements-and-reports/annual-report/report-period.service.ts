import {
  reportPeriodOf,
  type ReportPeriod,
} from '../../../../shared/achievements-and-reports/report-period';
import type { DayAndMonth } from '../../../../shared/treasury/financial-year';
import { ServiceUnavailableError } from '../../../core/errors';
import { getSetting } from '../../../core/settings';

/** D-215 (O-154): the day the unit's report year begins; until it is set, reports wait (8.1). */
async function reportYearStart(db: D1Database, unitId: string): Promise<DayAndMonth> {
  const start = await getSetting<DayAndMonth>(
    db,
    'achievements-and-reports.report_year_start',
    unitId,
  );
  if (start.status === 'not-configured')
    throw new ServiceUnavailableError('setting.not-configured');
  return start.value;
}

/** The first and last days the unit's report for `year` covers. */
export async function reportPeriodFor(
  db: D1Database,
  unitId: string,
  year: number,
): Promise<ReportPeriod> {
  return reportPeriodOf(year, await reportYearStart(db, unitId));
}

/** O-157: the latest year whose period has ended by `today` — the report that can be started now. */
export async function latestEndedYear(
  db: D1Database,
  unitId: string,
  today: string,
): Promise<number> {
  const start = await reportYearStart(db, unitId);
  const year = Number(today.slice(0, 4));
  return reportPeriodOf(year - 1, start).end < today ? year - 1 : year - 2;
}

/**
 * D-216: every year whose period has ended by `today`, from the year the
 * unit's earliest record falls in — latest first — for starting a report.
 */
export async function endedYearsSince(
  db: D1Database,
  unitId: string,
  params: { earliest: string; today: string },
): Promise<number[]> {
  const latest = await latestEndedYear(db, unitId, params.today);
  const start = await reportYearStart(db, unitId);
  const earliestYear = Number(params.earliest.slice(0, 4));
  const first =
    reportPeriodOf(earliestYear, start).start <= params.earliest ? earliestYear : earliestYear - 1;
  const years: number[] = [];
  for (let year = latest; year >= first; year -= 1) years.push(year);
  return years;
}
