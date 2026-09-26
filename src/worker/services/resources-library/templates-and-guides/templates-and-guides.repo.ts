import type { ResourceKind, ResourceRecord } from '../../../../shared/resources-library/resource';
import type { ResourceDetails } from './templates-and-guides.schema';

export type ResourceRow = Omit<ResourceRecord, 'national'> & { fileId: string };

const SELECT = `SELECT r.id, r.unit_id AS unitId, r.kind, r.title, r.description, r.language,
    r.file_id AS fileId, f.file_name AS fileName, r.retired_at AS retiredAt, r.version
  FROM library_resources r JOIN files f ON f.id = r.file_id`;

/** The templates and guides of these units, retired ones included, by title. */
export async function listResourcesOf(db: D1Database, unitIds: string[]): Promise<ResourceRow[]> {
  const marks = unitIds.map(() => '?').join(', ');
  const result = await db
    .prepare(`${SELECT} WHERE r.unit_id IN (${marks}) ORDER BY r.title`)
    .bind(...unitIds)
    .all<ResourceRow>();
  return result.results;
}

export async function findResource(
  db: D1Database,
  resourceId: string,
): Promise<ResourceRow | null> {
  return db.prepare(`${SELECT} WHERE r.id = ?`).bind(resourceId).first<ResourceRow>();
}

export function buildInsertResourceStatement(
  db: D1Database,
  row: ResourceDetails & {
    id: string;
    unitId: string;
    kind: ResourceKind;
    fileId: string;
    actor: string;
    at: string;
  },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_resources (id, unit_id, kind, title, description, language, file_id,
         retired_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.kind,
      row.title,
      row.description,
      row.language,
      row.fileId,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change from `version` (9.1): new details, or a new file (the old one is kept, D-104). */
export function buildUpdateResourceStatement(
  db: D1Database,
  change: { id: string; version: number; actor: string; at: string } & (
    { details: ResourceDetails } | { fileId: string }
  ),
): D1PreparedStatement {
  const next = [change.version + 1, change.actor, change.at, change.id];
  if ('fileId' in change) {
    return db
      .prepare(
        'UPDATE library_resources SET file_id = ?, version = ?, updated_by = ?, updated_at = ? WHERE id = ?',
      )
      .bind(change.fileId, ...next);
  }
  const d = change.details;
  return db
    .prepare(
      `UPDATE library_resources SET title = ?, description = ?, language = ?,
         version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(d.title, d.description, d.language, ...next);
}
