import type { Language } from '../../../../shared/core/languages';
import type { MeetingDetail } from '../../../../shared/meeting-recorder/meeting-records';
import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ServiceUnavailableError } from '../../../core/errors';
import { storeGeneratedFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { readBranding } from '../../administration-panel';
import type { NotificationsQueue } from '../../communication-hub';
import { fileRecord } from '../../documents-archive';
import { requireChairSecretaryOrManager } from '../chair-or-secretary';
import { requireMeetingUnit, runMeetingBatch, type MeetingUnitRow } from '../meeting-access';
import { listAgenda, listAttendees } from '../meetings/meeting-detail.repo';
import { alertMessage, hubMessageStatements } from '../targets/meeting-targets';
import { meetingReportDocument } from './meeting-report-document';
import type { MeetingReportRenderer } from './meeting-report-renderer';

/** D-203 and D-206: every attendee marked, and every item with its vote or decision. */
function requireComplete(detail: MeetingDetail): void {
  if (detail.attendees.some((a) => a.attendance === null))
    throw new ConflictError('meeting-recorder.attendance-unmarked');
  if (detail.agenda.some((i) => i.outcomeKind === null))
    throw new ConflictError('meeting-recorder.item-without-outcome');
}

async function writtenReport(
  db: D1Database,
  unit: MeetingUnitRow,
  detail: MeetingDetail,
  language: Language,
) {
  const { organisationName } = await readBranding(db);
  if (!organisationName) throw new ServiceUnavailableError('setting.not-configured');
  const ar = language === 'ar';
  return meetingReportDocument(detail, {
    language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    unitName: ar ? unit.nameAr : unit.nameEn,
  });
}

/** Brief 9.3, 9.4 and 13 A1: the report's PDF in R2, locked, and filed to the Meetings category, dated the meeting. */
async function reportFiling(
  db: D1Database,
  storage: FileStorage,
  p: { unit: MeetingUnitRow; detail: MeetingDetail; title: string; pdf: Uint8Array; actor: string },
) {
  const { meeting } = p.detail;
  const { file, statement } = await storeGeneratedFile(storage.bucket, db, {
    unitId: p.unit.id,
    unitCode: p.unit.code,
    service: 'meeting-recorder',
    recordId: meeting.id,
    use: 'documents',
    fileName: `meeting-report-${meeting.id}.pdf`,
    contentType: 'application/pdf',
    body: p.pdf,
    createdBy: p.actor,
    locked: true,
  });
  const filing = fileRecord(db, {
    file,
    categoryId: 'meetings',
    sourceService: 'meeting-recorder',
    sourceRecordId: meeting.id,
    title: p.title,
    documentDate: meeting.date,
    filedBy: p.actor,
  });
  return { fileId: file.id, statements: [statement, ...filing] };
}

/**
 * Brief 22 C1, 10.1 ("Meeting report logged") and D-208: the report's PDF
 * to R2 first; then in one batch it is filed, the meeting is logged and
 * locked, and "meeting has taken place" is posted — skipped while the hub
 * is off (D-209). The alert follows through the Queue.
 */
export async function logMeetingReport(
  db: D1Database,
  queue: NotificationsQueue,
  ctx: RequestContext,
  deps: { storage: FileStorage; render: MeetingReportRenderer },
  params: { unitId: string; meetingId: string; version: number; language: Language },
): Promise<void> {
  const meeting = await requireChairSecretaryOrManager(db, ctx, params);
  if (meeting.status !== MeetingStatus.Held)
    throw new ConflictError('meeting-recorder.wrong-status');
  const detail = {
    meeting,
    attendees: await listAttendees(db, meeting.id),
    agenda: await listAgenda(db, meeting.id),
  };
  requireComplete(detail);
  const unit = await requireMeetingUnit(db, params.unitId);
  const written = await writtenReport(db, unit, detail, params.language);
  const filing = await reportFiling(db, deps.storage, {
    unit,
    detail,
    title: written.title,
    pdf: await deps.render(written),
    actor: ctx.personId,
  });
  const at = new Date().toISOString();
  const post = await hubMessageStatements(db, meeting, 'meeting-held', { actor: ctx.personId, at });
  await runMeetingBatch(db, [
    ...filing.statements,
    db
      .prepare(
        `UPDATE meetings SET status = 'Report logged', logged_at = ?, logged_by = ?, report_file_id = ?,
           version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(at, ctx.personId, filing.fileId, params.version + 1, ctx.personId, at, meeting.id),
    ...post.statements,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'meeting.report-logged',
      entityType: 'meeting',
      entityId: meeting.id,
    }),
  ]);
  await alertMessage(queue, params.unitId, post.noticeId, ctx.personId);
}
