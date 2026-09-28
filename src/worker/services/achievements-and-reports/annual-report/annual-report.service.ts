import type {
  AnnualReportContent,
  AnnualReportRecord,
  AnnualReportsView,
} from '../../../../shared/achievements-and-reports/annual-report';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import {
  MANAGE,
  READ,
  requireAchievementCapability,
  requireWritable,
  runAchievementBatch,
  type AchievementUnitRow,
} from '../achievement-access';
import {
  buildInsertDraftStatement,
  buildSaveSummaryStatement,
  findReport,
  listReports,
  type AnnualReportRow,
} from './annual-report.repo';
import { latestEndedYear, reportPeriodFor } from './report-period.service';
import { assembleReport } from './report-content';

interface Ref {
  unitId: string;
  reportId: string;
}

/** Brief 24 B2 and O-157: the unit's reports, and the latest year that can be started. */
export async function annualReports(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<AnnualReportsView> {
  const unit = await requireAchievementCapability(db, ctx, READ, unitId);
  const reports = await listReports(db, unit.id);
  return {
    reports: reports.map(({ id, year, status }) => ({ id, year, status })),
    latestEndedYear: await latestEndedYear(db, unit.id, getTodayInLondon()).catch(() => null),
  };
}

/** O-157: a draft is started once the year's period has ended — one per unit and year. */
export async function startReport(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; year: number },
): Promise<{ id: string }> {
  const unit = await requireAchievementCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const period = await reportPeriodFor(db, unit.id, params.year);
  if (period.end >= getTodayInLondon())
    throw new ConflictError('achievements-and-reports.year-not-ended');
  if ((await listReports(db, unit.id)).some((r) => r.year === params.year))
    throw new ConflictError('achievements-and-reports.already-started');
  const id = generateId();
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    buildInsertDraftStatement(db, {
      id,
      unitId: unit.id,
      year: params.year,
      start: period.start,
      end: period.end,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'annual-report.started',
      entityType: 'annual-report',
      entityId: id,
      after: { year: params.year },
    }),
  ]);
  return { id };
}

/** A draft's content, assembled afresh from the records (O-157); a finalised one's, as frozen (O-158). */
export async function contentOf(
  db: D1Database,
  unit: AchievementUnitRow,
  row: AnnualReportRow,
): Promise<AnnualReportContent> {
  if (row.status === 'Finalised' && row.content)
    return JSON.parse(row.content) as AnnualReportContent;
  return assembleReport(db, {
    unit,
    year: row.year,
    period: { start: row.periodStart, end: row.periodEnd },
    summary: row.summary,
    today: getTodayInLondon(),
  });
}

export async function requireReport(db: D1Database, unitId: string, reportId: string) {
  const row = await findReport(db, unitId, reportId);
  if (!row) throw new NotFoundError('achievements-and-reports.report-not-found');
  return row;
}

/** Brief 24 B2: one report, for the unit's readers. */
export async function annualReport(
  db: D1Database,
  ctx: RequestContext,
  params: Ref,
): Promise<AnnualReportRecord> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  const row = await requireReport(db, unit.id, params.reportId);
  const { id, unitId, year, status, summary, version, finalisedAt, finalisedByName } = row;
  return {
    id,
    unitId,
    year,
    status,
    summary,
    version,
    finalisedAt,
    finalisedByName,
    content: await contentOf(db, unit, row),
  };
}

/** O-157: the branch's review — its own summary — saved while the report is a draft. */
export async function saveSummary(
  db: D1Database,
  ctx: RequestContext,
  params: Ref & { summary: string | null; version: number },
): Promise<void> {
  const unit = await requireAchievementCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const row = await requireReport(db, unit.id, params.reportId);
  if (row.status !== 'Draft') throw new ConflictError('achievements-and-reports.locked');
  await runAchievementBatch(db, [
    buildSaveSummaryStatement(db, {
      id: row.id,
      summary: params.summary?.length ? params.summary : null,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
  ]);
}
