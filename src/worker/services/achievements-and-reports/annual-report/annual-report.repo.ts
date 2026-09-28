import type { AnnualReportStatus } from '../../../../shared/achievements-and-reports/annual-report-statuses';

export interface AnnualReportRow {
  id: string;
  unitId: string;
  year: number;
  periodStart: string;
  periodEnd: string;
  status: AnnualReportStatus;
  summary: string | null;
  content: string | null;
  fileId: string | null;
  finalisedAt: string | null;
  finalisedByName: string | null;
  version: number;
}

const SELECT = `SELECT r.id, r.unit_id AS unitId, r.year, r.period_start AS periodStart,
  r.period_end AS periodEnd, r.status, r.summary, r.content, r.file_id AS fileId,
  r.finalised_at AS finalisedAt, p.name AS finalisedByName, r.version
  FROM annual_reports r LEFT JOIN people p ON p.id = r.finalised_by`;

/** The unit's reports, the latest year first. */
export async function listReports(db: D1Database, unitId: string): Promise<AnnualReportRow[]> {
  const result = await db
    .prepare(`${SELECT} WHERE r.unit_id = ? ORDER BY r.year DESC`)
    .bind(unitId)
    .all<AnnualReportRow>();
  return result.results;
}

/** One of the unit's reports, or null — another unit's is never found. */
export async function findReport(
  db: D1Database,
  unitId: string,
  reportId: string,
): Promise<AnnualReportRow | null> {
  return db
    .prepare(`${SELECT} WHERE r.unit_id = ? AND r.id = ?`)
    .bind(unitId, reportId)
    .first<AnnualReportRow>();
}

/** O-157: a new draft for the year — one per unit and year (a unique index holds it). */
export function buildInsertDraftStatement(
  db: D1Database,
  p: {
    id: string;
    unitId: string;
    year: number;
    start: string;
    end: string;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO annual_reports (id, unit_id, year, period_start, period_end, status, summary, content,
         language, file_id, finalised_by, finalised_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Draft', NULL, NULL, NULL, NULL, NULL, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(p.id, p.unitId, p.year, p.start, p.end, p.actor, p.at, p.actor, p.at);
}

/** O-157: the branch's own summary, from the version read (9.1). */
export function buildSaveSummaryStatement(
  db: D1Database,
  p: { id: string; summary: string | null; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE annual_reports SET summary = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
    )
    .bind(p.summary, p.version + 1, p.actor, p.at, p.id);
}

/** O-158: finalised — its content frozen, its PDF recorded, and locked for good. */
export function buildFinaliseStatement(
  db: D1Database,
  p: {
    id: string;
    content: string;
    language: string;
    fileId: string;
    version: number;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE annual_reports SET status = 'Finalised', content = ?, language = ?, file_id = ?,
         finalised_by = ?, finalised_at = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(p.content, p.language, p.fileId, p.actor, p.at, p.version + 1, p.actor, p.at, p.id);
}
