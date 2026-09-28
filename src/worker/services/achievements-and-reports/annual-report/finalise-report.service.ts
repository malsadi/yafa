import type { Language } from '../../../../shared/core/languages';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError, ServiceUnavailableError } from '../../../core/errors';
import { findFile, serveFile, storeGeneratedFile, type FileStorage } from '../../../core/files';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { readBranding } from '../../administration-panel';
import { fileRecord } from '../../documents-archive';
import {
  MANAGE,
  READ,
  requireAchievementCapability,
  requireWritable,
  runAchievementBatch,
  type AchievementUnitRow,
} from '../achievement-access';
import { annualReportDocument } from '../../../../pdf-templates/annual-report/write-annual-report';
import { buildFinaliseStatement, type AnnualReportRow } from './annual-report.repo';
import { requireReport } from './annual-report.service';
import type { AnnualReportRenderer } from './report-renderer';
import { assembleReport } from './report-content';

interface Ref {
  unitId: string;
  reportId: string;
}

/** O-156, O-158: the content assembled once more, with the officers current today, and written out. */
async function writeReport(
  db: D1Database,
  unit: AchievementUnitRow,
  row: AnnualReportRow,
  language: Language,
) {
  const content = await assembleReport(db, {
    unit,
    year: row.year,
    period: { start: row.periodStart, end: row.periodEnd },
    summary: row.summary,
    today: getTodayInLondon(),
  });
  const { organisationName } = await readBranding(db);
  if (!organisationName) throw new ServiceUnavailableError('setting.not-configured');
  const name = (language === 'ar' ? organisationName.ar : null) ?? organisationName.en;
  return { content, written: annualReportDocument(content, { language, organisationName: name }) };
}

/** Brief 9.3, 9.4: the report's PDF to R2 first, locked, with the statement recording it. */
function storeReportPdf(
  db: D1Database,
  deps: { storage: FileStorage },
  p: { unit: AchievementUnitRow; row: AnnualReportRow; pdf: Uint8Array; actor: string },
) {
  return storeGeneratedFile(deps.storage.bucket, db, {
    unitId: p.unit.id,
    unitCode: p.unit.code,
    service: 'achievements-and-reports',
    recordId: p.row.id,
    use: 'documents',
    fileName: `annual-report-${String(p.row.year)}.pdf`,
    contentType: 'application/pdf',
    body: p.pdf,
    createdBy: p.actor,
    locked: true,
  });
}

/**
 * Brief 24 B2, 10.1 ("Annual report finalised") and D-215 (O-158): the
 * content frozen; its PDF, in the finalising officer's language, to R2
 * first; then in one batch it is filed to Annual reports and the report
 * locked. P18's warning is shown on screen before this; it never blocks.
 * Made during the request, as the other PDFs are (D-213 choice).
 */
export async function finaliseReport(
  db: D1Database,
  ctx: RequestContext,
  deps: { storage: FileStorage; render: AnnualReportRenderer },
  params: Ref & { version: number; language: Language },
): Promise<void> {
  const unit = await requireAchievementCapability(db, ctx, MANAGE, params.unitId);
  requireWritable(unit);
  const row = await requireReport(db, unit.id, params.reportId);
  if (row.status !== 'Draft') throw new ConflictError('achievements-and-reports.locked');
  const { content, written } = await writeReport(db, unit, row, params.language);
  const { file, statement } = await storeReportPdf(db, deps, {
    unit,
    row,
    pdf: await deps.render(written),
    actor: ctx.personId,
  });
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    statement,
    ...fileRecord(db, {
      file,
      categoryId: 'annual-reports',
      sourceService: 'achievements-and-reports',
      sourceRecordId: row.id,
      title: written.title,
      documentDate: row.periodEnd,
      filedBy: ctx.personId,
    }),
    buildFinaliseStatement(db, {
      id: row.id,
      content: JSON.stringify(content),
      language: params.language,
      fileId: file.id,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'annual-report.finalised',
      entityType: 'annual-report',
      entityId: row.id,
      after: { year: row.year, fileId: file.id },
    }),
  ]);
}

/** Brief 24 B2: the finalised report's PDF, for the unit's readers. */
export async function downloadReport(
  db: D1Database,
  ctx: RequestContext,
  storage: FileStorage,
  params: Ref,
): Promise<Response> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  const row = await requireReport(db, unit.id, params.reportId);
  const file = row.fileId ? await findFile(db, row.fileId) : null;
  if (!file) throw new NotFoundError('achievements-and-reports.report-not-finalised');
  return serveFile(db, storage, file);
}
