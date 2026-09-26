import type { VenueNoteRecord, VenueRecord } from '../../../../shared/resources-library/venue';
import type { VenueDetailsInput } from './venues.schema';

export type VenueRow = Omit<VenueRecord, 'national' | 'notes'>;

const COLUMNS = `id, unit_id AS unitId, name, address, capacity, facilities,
  contact_name AS contactName, contact_phone AS contactPhone, contact_email AS contactEmail,
  typical_cost_pence AS typicalCostPence, typical_cost_note AS typicalCostNote,
  retired_at AS retiredAt, version`;
const DETAIL_COLUMNS = [
  ['name', 'name'],
  ['address', 'address'],
  ['capacity', 'capacity'],
  ['facilities', 'facilities'],
  ['contact_name', 'contactName'],
  ['contact_phone', 'contactPhone'],
  ['contact_email', 'contactEmail'],
  ['typical_cost_pence', 'typicalCostPence'],
  ['typical_cost_note', 'typicalCostNote'],
] as const;

export async function listVenuesOf(db: D1Database, unitIds: string[]): Promise<VenueRow[]> {
  const marks = unitIds.map(() => '?').join(', ');
  const result = await db
    .prepare(`SELECT ${COLUMNS} FROM library_venues WHERE unit_id IN (${marks}) ORDER BY name`)
    .bind(...unitIds)
    .all<VenueRow>();
  return result.results;
}

export async function findVenue(db: D1Database, venueId: string): Promise<VenueRow | null> {
  return db
    .prepare(`SELECT ${COLUMNS} FROM library_venues WHERE id = ?`)
    .bind(venueId)
    .first<VenueRow>();
}

/** D-107 and D-114: these venues' notes, retired ones included, the latest first. */
export async function listNotesOf(
  db: D1Database,
  venueIds: string[],
): Promise<(VenueNoteRecord & { venueId: string })[]> {
  if (venueIds.length === 0) return [];
  const marks = venueIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `SELECT n.id, n.venue_id AS venueId, n.text, p.name AS writtenByName, n.written_at AS writtenAt,
         n.retired_at AS retiredAt
       FROM library_venue_notes n LEFT JOIN people p ON p.id = n.written_by
       WHERE n.venue_id IN (${marks}) ORDER BY n.written_at DESC`,
    )
    .bind(...venueIds)
    .all<VenueNoteRecord & { venueId: string }>();
  return result.results;
}

export function buildInsertVenueStatement(
  db: D1Database,
  row: VenueDetailsInput & { id: string; unitId: string; actor: string; at: string },
): D1PreparedStatement {
  const columns = DETAIL_COLUMNS.map(([column]) => column).join(', ');
  const marks = DETAIL_COLUMNS.map(() => '?').join(', ');
  return db
    .prepare(
      `INSERT INTO library_venues (id, unit_id, ${columns}, retired_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ${marks}, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      ...DETAIL_COLUMNS.map(([, key]) => row[key]),
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change from `version` (9.1). */
export function buildUpdateVenueStatement(
  db: D1Database,
  change: { id: string; version: number; actor: string; at: string; venue: VenueDetailsInput },
): D1PreparedStatement {
  const assignments = DETAIL_COLUMNS.map(([column]) => `${column} = ?`).join(', ');
  return db
    .prepare(
      `UPDATE library_venues SET ${assignments}, version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      ...DETAIL_COLUMNS.map(([, key]) => change.venue[key]),
      change.version + 1,
      change.actor,
      change.at,
      change.id,
    );
}

export function buildInsertNoteStatement(
  db: D1Database,
  row: { id: string; venueId: string; unitId: string; text: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_venue_notes (id, venue_id, unit_id, text, written_by, written_at, retired_at, retired_by)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
    )
    .bind(row.id, row.venueId, row.unitId, row.text, row.actor, row.at);
}

/** D-107 and D-114: retire a note, recording who and when — or bring it back. */
export function buildSetNoteRetiredStatement(
  db: D1Database,
  row: { noteId: string; venueId: string; retired: { by: string; at: string } | null },
): D1PreparedStatement {
  return db
    .prepare(
      'UPDATE library_venue_notes SET retired_at = ?, retired_by = ? WHERE id = ? AND venue_id = ?',
    )
    .bind(row.retired?.at ?? null, row.retired?.by ?? null, row.noteId, row.venueId);
}
