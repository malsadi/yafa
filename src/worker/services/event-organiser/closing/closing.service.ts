import type { Language } from '../../../../shared/core/languages';
import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import { CLOSABLE_STATUSES } from '../../../../shared/event-organiser/event-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ServiceUnavailableError } from '../../../core/errors';
import type { FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { getTextBundle } from '../../../../web/text';
import { fillText } from '../../../../web/text/fill-text';
import { readBranding } from '../../administration-panel';
import { closeEventAccount, eventBudgetFigures, listOpenBranchAccounts } from '../../treasury';
import {
  requireEventCapability,
  requireWritable,
  runEventBatch,
  type EventUnitRow,
} from '../event-access';
import { requireUnitEvent } from '../events/event-guards';
import { buildReportData } from '../report/report-data';
import { reportDocument } from '../report/report-document';
import type { ReportRenderer } from '../report/report-renderer';
import { eventFilesFilingStatements, reportFilingStatements } from './closing-files';

export const CLOSE = 'event-organiser.events.close';

interface EventRef {
  unitId: string;
  eventId: string;
}

/** D-184: closed only from Completed or Cancelled, by those who close events. */
async function requireClosable(db: D1Database, ctx: RequestContext, params: EventRef) {
  const unit = await requireEventCapability(db, ctx, CLOSE, params.unitId);
  requireWritable(unit);
  const event = await requireUnitEvent(db, params.unitId, params.eventId);
  if (!CLOSABLE_STATUSES.includes(event.status))
    throw new ConflictError('event-organiser.not-closable');
  return { unit, event };
}

/** P16 and D-131: before closing, the balance to settle — an overspend is warned of clearly — and the accounts to choose. */
export async function closePreview(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef,
): Promise<{ balancePence: number; branchAccounts: { id: string; name: string }[] }> {
  const { event } = await requireClosable(db, ctx, params);
  const [figures, branchAccounts] = await Promise.all([
    eventBudgetFigures(db, event.id),
    listOpenBranchAccounts(db, event.unitId),
  ]);
  return { balancePence: figures.balancePence, branchAccounts };
}

/** Brief 21 C1, 9.4: the report written out in the closing officer's language, headed with the organisation. */
async function writtenReport(
  db: D1Database,
  unit: EventUnitRow,
  event: EventSummary,
  language: Language,
) {
  const { organisationName } = await readBranding(db);
  if (!organisationName) throw new ServiceUnavailableError('setting.not-configured');
  const ar = language === 'ar';
  return reportDocument(await buildReportData(db, event), {
    language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    unitName: ar ? unit.nameAr : unit.nameEn,
  });
}

/**
 * Brief 21 C2, 10.1 ("Event closed"), P16 and D-184: the report's PDF to R2
 * first; then in one batch the balance moved to the chosen branch account
 * and the event account closed, the report and every event file locked and
 * filed to the archive, and the event closed — locking it and its tasks.
 * D-193: the transfer names the event, in the closing officer's language.
 */
export async function closeEvent(
  db: D1Database,
  ctx: RequestContext,
  deps: { storage: FileStorage; render: ReportRenderer },
  params: EventRef & { version: number; branchAccountId: string; language: Language },
): Promise<void> {
  const { unit, event } = await requireClosable(db, ctx, params);
  const account = await closeEventAccount(db, {
    eventId: event.id,
    branchAccountId: params.branchAccountId,
    description: fillText(
      getTextBundle(params.language).services['event-organiser'].closingTransfer,
      {
        event: event.name,
      },
    ),
    actor: ctx.personId,
  });
  const written = await writtenReport(db, unit, event, params.language);
  const pdf = await deps.render(written);
  const report = await reportFilingStatements(db, deps.storage, {
    unit,
    event,
    title: written.title,
    pdf,
    actor: ctx.personId,
  });
  const at = new Date().toISOString();
  await runEventBatch(db, [
    ...account.statements,
    ...report.statements,
    ...(await eventFilesFilingStatements(db, { event, actor: ctx.personId })),
    db
      .prepare(
        `UPDATE events SET status = 'Closed', closed_by = ?, closed_at = ?, report_file_id = ?,
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(ctx.personId, at, report.fileId, params.version + 1, ctx.personId, at, event.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'event.closed',
      entityType: 'event',
      entityId: event.id,
      before: { status: event.status, balancePence: account.balancePence },
      after: { status: 'Closed', branchAccountId: params.branchAccountId },
    }),
  ]);
}
