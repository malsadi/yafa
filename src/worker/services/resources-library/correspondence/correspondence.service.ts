import type { FileRecord } from '../../../../shared/core/file-record';
import { buildFiledLetterStatement, type LetterDirection } from './correspondence.repo';

export interface FileLetterInput {
  /** The letter's locked PDF (out) or scan (in), recorded earlier in the same batch. */
  file: FileRecord;
  referenceNumber: string;
  letterId: string;
}

/**
 * Brief 16 D2, D3 and 9.2: files a letter sent (Letters out) or received
 * (Letters in) under its reference number. Only the Correspondence service
 * calls it, inside its own batch (R2 first, then one batch).
 */
export function fileLetter(
  db: D1Database,
  direction: LetterDirection,
  input: FileLetterInput,
): D1PreparedStatement {
  if (!input.file.locked) throw new Error('resources-library.file-not-locked');
  return buildFiledLetterStatement(db, direction, {
    unitId: input.file.unitId,
    referenceNumber: input.referenceNumber,
    letterId: input.letterId,
    fileId: input.file.id,
    filedAt: new Date().toISOString(),
  });
}
