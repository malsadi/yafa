import type { LetterTemplateRecord } from '../../../../shared/resources-library/letter-template';
import type { LetterTemplateInput } from './letter-templates.schema';

export type LetterTemplateRow = Omit<LetterTemplateRecord, 'national'>;

const COLUMNS = `id, unit_id AS unitId, title, subject, body, fields, language,
  retired_at AS retiredAt, version`;

function toRow(row: LetterTemplateRow & { fields: string | string[] }): LetterTemplateRow {
  return {
    ...row,
    fields: typeof row.fields === 'string' ? (JSON.parse(row.fields) as string[]) : row.fields,
  };
}

/** The templates of these units, retired ones included, by title. */
export async function listTemplatesOf(
  db: D1Database,
  unitIds: string[],
): Promise<LetterTemplateRow[]> {
  const marks = unitIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT ${COLUMNS} FROM library_letter_templates WHERE unit_id IN (${marks}) ORDER BY title`,
    )
    .bind(...unitIds)
    .all<LetterTemplateRow & { fields: string }>();
  return result.results.map(toRow);
}

export async function findTemplate(
  db: D1Database,
  templateId: string,
): Promise<LetterTemplateRow | null> {
  const row = await db
    .prepare(`SELECT ${COLUMNS} FROM library_letter_templates WHERE id = ?`)
    .bind(templateId)
    .first<LetterTemplateRow & { fields: string }>();
  return row ? toRow(row) : null;
}

export function buildInsertTemplateStatement(
  db: D1Database,
  row: { id: string; unitId: string; actor: string; at: string } & LetterTemplateInput,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_letter_templates
        (id, unit_id, title, subject, body, fields, language, retired_at, version,
         created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.title,
      row.subject,
      row.body,
      JSON.stringify(row.fields),
      row.language,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/**
 * A change made from `version`: it becomes version + 1, which the trigger
 * refuses unless the stored version is still `version` (9.1).
 */
export function buildUpdateTemplateStatement(
  db: D1Database,
  change: { id: string; version: number; actor: string; at: string; template: LetterTemplateInput },
): D1PreparedStatement {
  const t = change.template;
  return db
    .prepare(
      `UPDATE library_letter_templates SET title = ?, subject = ?, body = ?, fields = ?, language = ?,
         version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      t.title,
      t.subject,
      t.body,
      JSON.stringify(t.fields),
      t.language,
      change.version + 1,
      change.actor,
      change.at,
      change.id,
    );
}
