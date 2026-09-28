import type {
  LetterOutDetail,
  LetterOutSummary,
} from '../../../../shared/correspondence-and-letters/letter-records';

const SUMMARY = `o.id, o.reference_number AS referenceNumber, o.letter_date AS letterDate,
  o.recipient_name AS recipientName, o.subject, p.name AS signerName`;
const FROM = 'FROM letters_out o LEFT JOIN people p ON p.id = o.signer_person_id';

export interface LetterOutRow {
  id: string;
  unitId: string;
  referenceNumber: string;
  sequenceYear: number;
  sequenceNumber: number;
  letterDate: string;
  templateId: string;
  language: string;
  recipientName: string;
  recipientAddress: string | null;
  subject: string;
  fieldValues: Record<string, string>;
  signerPersonId: string;
  signerRoleId: string;
  replyToLetterInId: string | null;
  fileId: string;
  createdAt: string;
}

/** Brief 23 B2: a letter out's register entry, for its unit's own batch. */
export function buildInsertLetterOutStatement(
  db: D1Database,
  row: LetterOutRow,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO letters_out (id, unit_id, reference_number, sequence_year, sequence_number,
         letter_date, template_id, language, recipient_name, recipient_address, subject,
         field_values, signer_person_id, signer_role_id, reply_to_letter_in_id, file_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.referenceNumber,
      row.sequenceYear,
      row.sequenceNumber,
      row.letterDate,
      row.templateId,
      row.language,
      row.recipientName,
      row.recipientAddress,
      row.subject,
      JSON.stringify(row.fieldValues),
      row.signerPersonId,
      row.signerRoleId,
      row.replyToLetterInId,
      row.fileId,
      row.createdAt,
    );
}

/** Brief 23 B2: the unit's letters out, the latest first. */
export async function listLettersOut(db: D1Database, unitId: string): Promise<LetterOutSummary[]> {
  const result = await db
    .prepare(
      `SELECT ${SUMMARY} ${FROM} WHERE o.unit_id = ?
       ORDER BY o.letter_date DESC, o.sequence_year DESC, o.sequence_number DESC`,
    )
    .bind(unitId)
    .all<LetterOutSummary>();
  return result.results;
}

export type LetterOutFound = Omit<LetterOutDetail, 'exchange'> & { fileId: string };

/** One of the unit's letters out, or null — another unit's is never found (7.3). */
export async function findLetterOut(
  db: D1Database,
  unitId: string,
  letterId: string,
): Promise<LetterOutFound | null> {
  return db
    .prepare(
      `SELECT ${SUMMARY}, o.recipient_address AS recipientAddress, o.language,
         r.name_en AS signerRoleNameEn, r.name_ar AS signerRoleNameAr,
         o.reply_to_letter_in_id AS replyToLetterInId, o.file_id AS fileId
       ${FROM} LEFT JOIN roles r ON r.id = o.signer_role_id
       WHERE o.unit_id = ? AND o.id = ?`,
    )
    .bind(unitId, letterId)
    .first<LetterOutFound>();
}

/** O-140: the roles the writer holds in the unit today, to sign with. */
export async function signerRolesOf(
  db: D1Database,
  params: { personId: string; unitId: string; today: string },
): Promise<{ roleId: string; nameEn: string; nameAr: string }[]> {
  const result = await db
    .prepare(
      `SELECT DISTINCT r.id AS roleId, r.name_en AS nameEn, r.name_ar AS nameAr
       FROM terms t JOIN roles r ON r.id = t.role_id
       WHERE t.person_id = ? AND t.unit_id = ? AND t.start_date <= ?
         AND (t.end_date IS NULL OR t.end_date > ?)
       ORDER BY r.name_en`,
    )
    .bind(params.personId, params.unitId, params.today, params.today)
    .all<{ roleId: string; nameEn: string; nameAr: string }>();
  return result.results;
}

/** Brief 23 B4 and O-144: a reply marks the letter it answers Replied, in the reply's batch. */
export function buildMarkRepliedStatement(
  db: D1Database,
  params: { letterInId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE letters_in SET status = 'Replied', version = version + 1, updated_by = ?, updated_at = ?
       WHERE id = ? AND status IN ('Received', 'Awaiting reply')`,
    )
    .bind(params.actor, params.at, params.letterInId);
}
