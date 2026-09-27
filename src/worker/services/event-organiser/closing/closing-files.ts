import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import type { FileRecord } from '../../../../shared/core/file-record';
import { findFile, storeGeneratedFile, type FileStorage } from '../../../core/files';
import { fileRecord } from '../../documents-archive';
import type { EventUnitRow } from '../event-access';

const EVENTS_CATEGORY = 'events';

/** The day an event's filings are dated: its last day, or its only one. */
const documentDate = (event: EventSummary) => event.lastDay ?? event.firstDay;

/**
 * Brief 21 C2, 9.3, 9.4 and 10.1 ("Event closed"): the report's PDF written
 * to R2 first, locked, and filed to the archive's Events category — the
 * statements for the close's batch.
 */
export async function reportFilingStatements(
  db: D1Database,
  storage: FileStorage,
  params: {
    unit: EventUnitRow;
    event: EventSummary;
    title: string;
    pdf: Uint8Array;
    actor: string;
  },
): Promise<{ fileId: string; statements: D1PreparedStatement[] }> {
  const { file, statement } = await storeGeneratedFile(storage.bucket, db, {
    unitId: params.unit.id,
    unitCode: params.unit.code,
    service: 'event-organiser',
    recordId: params.event.id,
    use: 'documents',
    fileName: `post-event-report-${params.event.id}.pdf`,
    contentType: 'application/pdf',
    body: params.pdf,
    createdBy: params.actor,
    locked: true,
  });
  const filing = fileRecord(db, {
    file,
    categoryId: EVENTS_CATEGORY,
    sourceService: 'event-organiser',
    sourceRecordId: params.event.id,
    title: params.title,
    documentDate: documentDate(params.event),
    filedBy: params.actor,
  });
  return { fileId: file.id, statements: [statement, ...filing] };
}

/**
 * Brief 21 C2 and D-184: every event file locked, then filed to the
 * archive's Events category under its own name — statements for the batch.
 */
export async function eventFilesFilingStatements(
  db: D1Database,
  params: { event: EventSummary; actor: string },
): Promise<D1PreparedStatement[]> {
  const { results } = await db
    .prepare('SELECT file_id AS fileId FROM event_files WHERE event_id = ? ORDER BY added_at')
    .bind(params.event.id)
    .all<{ fileId: string }>();
  const files = (await Promise.all(results.map((r) => findFile(db, r.fileId)))).filter(
    (f): f is FileRecord => f !== null,
  );
  return files.flatMap((file) => [
    db.prepare('UPDATE files SET locked = 1 WHERE id = ?').bind(file.id),
    ...fileRecord(db, {
      file: { ...file, locked: true },
      categoryId: EVENTS_CATEGORY,
      sourceService: 'event-organiser',
      sourceRecordId: `${params.event.id}/${file.id}`,
      title: file.fileName,
      documentDate: documentDate(params.event),
      filedBy: params.actor,
    }),
  ]);
}
