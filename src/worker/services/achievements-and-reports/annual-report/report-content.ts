import type { AnnualReportContent } from '../../../../shared/achievements-and-reports/annual-report';
import type { ReportPeriod } from '../../../../shared/achievements-and-reports/report-period';
import type { ServiceSlug } from '../../../../shared/core/services';
import type { YearEndSummary } from '../../../../shared/treasury/treasury-records';
import { isServiceEnabled } from '../../../core/service-switches';
import { listCurrentOfficerRolesOf } from '../../committee-register';
import { eventsCompletedBetween } from '../../event-organiser';
import { meetingsHeldBetween } from '../../meeting-recorder';
import { yearEndSummary } from '../../treasury';
import type { AchievementUnitRow } from '../achievement-access';
import { listAchievementsOf } from '../achievements/achievements.repo';

interface Assembly {
  unit: AchievementUnitRow;
  year: number;
  period: ReportPeriod;
  summary: string | null;
  /** O-156: the officers current on this day — the day it is finalised, or today in a draft. */
  today: string;
}

/** O-155: the Treasury's year that ends within the report's period. */
async function treasuryYear(db: D1Database, unitId: string, a: Assembly): Promise<YearEndSummary> {
  const [earlier, later] = await Promise.all([
    yearEndSummary(db, unitId, a.year - 1),
    yearEndSummary(db, unitId, a.year),
  ]);
  return later.end >= a.period.start && later.end <= a.period.end ? later : earlier;
}

/** O-160: a section's service switched off for the unit gives null — "not in use" — and the report goes on. */
async function ifOn<T>(
  db: D1Database,
  service: ServiceSlug,
  unitId: string,
  read: () => Promise<T>,
) {
  return (await isServiceEnabled(db, service, unitId)) ? read() : null;
}

/**
 * Brief 24 B2 and D-215 (P17, P18, O-155 to O-160): the report assembled
 * from the records — the year's achievements, events completed, meetings
 * held, the Treasury's year and the current officers.
 */
export async function assembleReport(db: D1Database, a: Assembly): Promise<AnnualReportContent> {
  const { unit, period } = a;
  const range = { unitId: unit.id, start: period.start, end: period.end };
  const [achievements, events, meetings, treasury, officers] = await Promise.all([
    listAchievementsOf(db, [unit.id]),
    ifOn(db, 'event-organiser', unit.id, () => eventsCompletedBetween(db, range)),
    ifOn(db, 'meeting-recorder', unit.id, () => meetingsHeldBetween(db, range)),
    ifOn(db, 'treasury', unit.id, () => treasuryYear(db, unit.id, a)),
    listCurrentOfficerRolesOf(db, unit.id, a.today),
  ]);
  return {
    unitNameEn: unit.nameEn,
    unitNameAr: unit.nameAr,
    year: a.year,
    periodStart: period.start,
    periodEnd: period.end,
    summary: a.summary,
    achievements: achievements
      .filter((x) => x.withdrawnAt === null && x.date >= period.start && x.date <= period.end)
      .reverse()
      .map((x) => ({
        title: x.title,
        date: x.date,
        categoryNameEn: x.categoryNameEn,
        categoryNameAr: x.categoryNameAr,
        officers: x.officers.map((o) => o.name ?? ''),
      })),
    events,
    meetings,
    treasury,
    officers: officers.map(({ name, roleNameEn, roleNameAr }) => ({
      name,
      roleNameEn,
      roleNameAr,
    })),
  };
}
