import type {
  LetterInDetail,
  LetterInSummary,
  WritingChoices,
} from '../../../../shared/correspondence-and-letters/letter-records';

const SUMMARY = `i.id, i.reference_number AS referenceNumber, i.date_received AS dateReceived,
  i.sender, i.subject, i.handler_person_id AS handlerPersonId, p.name AS handlerName,
  i.status, i.version`;
const FROM = 'FROM letters_in i LEFT JOIN people p ON p.id = i.handler_person_id';

export interface LetterInRow {
  id: string;
  unitId: string;
  referenceNumber: string;
  sequenceYear: number;
  sequenceNumber: number;
  dateReceived: string;
  sender: string;
  subject: string;
  handlerPersonId: string;
  answersLetterOutId: string | null;
  fileId: string;
  actor: string;
  at: string;
}

/** Brief 23 B3: a letter in's register entry, Received at version 1 (O-144). */
export function buildInsertLetterInStatement(
  db: D1Database,
  row: LetterInRow,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO letters_in (id, unit_id, reference_number, sequence_year, sequence_number,
         date_received, sender, subject, handler_person_id, status, answers_letter_out_id, file_id,
         version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Received', ?, ?, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.referenceNumber,
      row.sequenceYear,
      row.sequenceNumber,
      row.dateReceived,
      row.sender,
      row.subject,
      row.handlerPersonId,
      row.answersLetterOutId,
      row.fileId,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** Brief 23 B3: the unit's letters in, the latest received first. */
export const lettersInQuery = (unitId: string) => ({
  sql: `SELECT ${SUMMARY} ${FROM} WHERE i.unit_id = ?
       ORDER BY i.date_received DESC, i.sequence_year DESC, i.sequence_number DESC`,
  binds: [unitId],
});

export type LetterInFound = Omit<LetterInDetail, 'exchange'> & { fileId: string };

/** One of the unit's letters in, or null — another unit's is never found (7.3). */
export async function findLetterIn(
  db: D1Database,
  unitId: string,
  letterId: string,
): Promise<LetterInFound | null> {
  return db
    .prepare(
      `SELECT ${SUMMARY}, i.answers_letter_out_id AS answersLetterOutId, i.file_id AS fileId,
         f.file_name AS fileName
       ${FROM} JOIN files f ON f.id = i.file_id WHERE i.unit_id = ? AND i.id = ?`,
    )
    .bind(unitId, letterId)
    .first<LetterInFound>();
}

/** O-144: the unit's letters in that a reply can answer — never one needing no reply. */
export async function listAnswerableLettersIn(
  db: D1Database,
  unitId: string,
): Promise<WritingChoices['answerable']> {
  const result = await db
    .prepare(
      `SELECT id, reference_number AS referenceNumber, sender, subject, status FROM letters_in
       WHERE unit_id = ? AND status IN ('Received', 'Awaiting reply', 'Replied')
       ORDER BY date_received DESC, sequence_year DESC, sequence_number DESC`,
    )
    .bind(unitId)
    .all<WritingChoices['answerable'][number]>();
  return result.results;
}

export async function answerableLetterIn(
  db: D1Database,
  unitId: string,
  letterId: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 AS found FROM letters_in WHERE unit_id = ? AND id = ?
         AND status IN ('Received', 'Awaiting reply', 'Replied')`,
    )
    .bind(unitId, letterId)
    .first();
  return row !== null;
}

/** O-144, O-145: a new status or handling officer, from the version the officer read (9.1). */
export function buildUpdateLetterInStatement(
  db: D1Database,
  params: {
    letterId: string;
    status: string;
    handlerPersonId: string;
    version: number;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE letters_in SET status = ?, handler_person_id = ?, version = ?, updated_by = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      params.status,
      params.handlerPersonId,
      params.version + 1,
      params.actor,
      params.at,
      params.letterId,
    );
}

/** D-216: the letter out it answers, corrected while the letter in is open, from the version read. */
export function buildSetAnswersStatement(
  db: D1Database,
  params: {
    letterId: string;
    answersLetterOutId: string | null;
    version: number;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE letters_in SET answers_letter_out_id = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(params.answersLetterOutId, params.version + 1, params.actor, params.at, params.letterId);
}
