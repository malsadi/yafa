import type { FileRecord } from '../../../../shared/core/file-record';
import { buildAutomaticFilingStatements } from './filing.repo';

export interface FileRecordInput {
  /** The finished record's locked file, recorded earlier in the same batch. */
  file: FileRecord;
  categoryId: string;
  sourceService: string;
  sourceRecordId: string;
  title: string;
  /** The record's own date (D-097). */
  documentDate: string;
  filedBy: string;
}

/**
 * Brief 15 A1 and its build note: the only way an automatic filing is made.
 * Returns the statements for the calling service's own batch (build rule
 * 6), after its file statement. The file must already be locked, as the
 * record it belongs to is (A4); a trigger refuses it otherwise.
 */
export function fileRecord(db: D1Database, input: FileRecordInput): D1PreparedStatement[] {
  if (!input.file.locked) throw new Error('documents-archive.file-not-locked');
  return buildAutomaticFilingStatements(db, {
    unitId: input.file.unitId,
    categoryId: input.categoryId,
    sourceService: input.sourceService,
    sourceRecordId: input.sourceRecordId,
    title: input.title,
    documentDate: input.documentDate,
    fileId: input.file.id,
    filedBy: input.filedBy,
    filedAt: new Date().toISOString(),
  });
}
