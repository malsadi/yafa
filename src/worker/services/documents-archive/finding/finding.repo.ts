import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { londonDayStart } from '../../../../shared/core/london-day-start';
import type {
  ArchiveCategory,
  ArchiveDocumentSummary,
  ArchiveDocumentVersion,
} from '../../../../shared/documents-archive/archive-document';
import type { ArchiveVisibility } from './archive-visibility';
import type { ArchiveSearch } from './finding.schema';

const SUMMARY = `SELECT d.id, d.unit_id AS unitId, u.name_en AS unitNameEn, u.name_ar AS unitNameAr,
    d.category_id AS categoryId, d.source, d.title, d.description,
    d.document_date AS documentDate, d.filed_at AS filedAt, p.name AS filedByName,
    (SELECT MAX(v.version) FROM archive_document_versions v WHERE v.document_id = d.id) AS latestVersion
  FROM archive_documents d
  JOIN units u ON u.id = d.unit_id
  LEFT JOIN people p ON p.id = d.filed_by`;

type Condition = [sql: string, ...params: string[]];

/** `%` and `_` in a title are searched for as themselves. */
function likeTitle(title: string): string {
  return `%${title.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

function dateConditions(search: ArchiveSearch): Condition[] {
  const conditions: Condition[] = [];
  if (search.dateField === 'document') {
    if (search.from) conditions.push(['d.document_date >= ?', search.from]);
    if (search.to) conditions.push(['d.document_date <= ?', search.to]);
  }
  if (search.dateField === 'filed') {
    if (search.from) conditions.push(['d.filed_at >= ?', londonDayStart(search.from)]);
    if (search.to) conditions.push(['d.filed_at < ?', londonDayStart(addDaysToDate(search.to, 1))]);
  }
  return conditions;
}

function searchConditions(visibility: ArchiveVisibility, search: ArchiveSearch): Condition[] {
  const conditions: Condition[] = [];
  if (!visibility.allUnits) {
    const marks = visibility.unitIds.map(() => '?').join(', ');
    conditions.push([`d.unit_id IN (${marks})`, ...visibility.unitIds]);
  }
  if (search.unitId) conditions.push(['d.unit_id = ?', search.unitId]);
  if (search.categoryId) conditions.push(['d.category_id = ?', search.categoryId]);
  if (search.title) conditions.push(["d.title LIKE ? ESCAPE '\\'", likeTitle(search.title)]);
  return [...conditions, ...dateConditions(search)];
}

/** Brief 15 B1: the documents this officer sees that match, newest filing first. */
export async function searchDocuments(
  db: D1Database,
  visibility: ArchiveVisibility,
  search: ArchiveSearch,
): Promise<ArchiveDocumentSummary[]> {
  const conditions = searchConditions(visibility, search);
  const where = conditions.length ? `WHERE ${conditions.map(([sql]) => sql).join(' AND ')}` : '';
  const result = await db
    .prepare(`${SUMMARY} ${where} ORDER BY d.filed_at DESC`)
    .bind(...conditions.flatMap(([, ...params]) => params))
    .all<ArchiveDocumentSummary>();
  return result.results;
}

export async function findDocument(
  db: D1Database,
  documentId: string,
): Promise<ArchiveDocumentSummary | null> {
  return db.prepare(`${SUMMARY} WHERE d.id = ?`).bind(documentId).first<ArchiveDocumentSummary>();
}

/** Brief 15 A4: every version, the latest first. */
export async function listVersions(
  db: D1Database,
  documentId: string,
): Promise<ArchiveDocumentVersion[]> {
  const result = await db
    .prepare(
      `SELECT v.version, f.file_name AS fileName, f.size, p.name AS addedByName, v.created_at AS createdAt
       FROM archive_document_versions v
       JOIN files f ON f.id = v.file_id
       LEFT JOIN people p ON p.id = v.added_by
       WHERE v.document_id = ? ORDER BY v.version DESC`,
    )
    .bind(documentId)
    .all<ArchiveDocumentVersion>();
  return result.results;
}

export async function findVersionFileId(
  db: D1Database,
  documentId: string,
  version: number,
): Promise<string | null> {
  const row = await db
    .prepare(
      'SELECT file_id AS fileId FROM archive_document_versions WHERE document_id = ? AND version = ?',
    )
    .bind(documentId, version)
    .first<{ fileId: string }>();
  return row?.fileId ?? null;
}

/** Brief 15 A3: the six categories, in the brief's order. */
export async function listCategories(db: D1Database): Promise<ArchiveCategory[]> {
  const result = await db
    .prepare(
      'SELECT id, name_en AS nameEn, name_ar AS nameAr FROM archive_categories ORDER BY position',
    )
    .all<ArchiveCategory>();
  return result.results;
}
