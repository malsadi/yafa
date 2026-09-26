import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { buildInsertNoteStatement, buildSetNoteRetiredStatement } from './venues.repo';
import { requireManagedVenue } from './venues.service';

/** D-098: add a dated note from past use, showing who wrote it and when. */
export async function addVenueNote(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; venueId: string; text: string },
): Promise<void> {
  const venue = await requireManagedVenue(db, ctx, params);
  const row = {
    id: generateId(),
    venueId: venue.id,
    unitId: venue.unitId,
    text: params.text,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await db.batch([
    buildInsertNoteStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'venue-note.added',
      entityType: 'venue-note',
      entityId: row.id,
      after: row,
    }),
  ]);
}

/**
 * D-107 and D-114: retire a note so it stops showing, recording who and
 * when, or bring a retired one back. Its text never changes; each step is
 * also in the audit log.
 */
export async function setVenueNoteRetired(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; venueId: string; noteId: string; retire: boolean },
): Promise<void> {
  const venue = await requireManagedVenue(db, ctx, params);
  const note = await db
    .prepare(
      'SELECT id, retired_at AS retiredAt FROM library_venue_notes WHERE id = ? AND venue_id = ?',
    )
    .bind(params.noteId, venue.id)
    .first<{ id: string; retiredAt: string | null }>();
  if (!note) throw new NotFoundError('resources-library.venue-note-not-found');
  if (params.retire === (note.retiredAt !== null)) {
    throw new ConflictError(
      params.retire ? 'resources-library.already-retired' : 'resources-library.not-retired',
    );
  }
  const retired = params.retire ? { by: ctx.personId, at: new Date().toISOString() } : null;
  await db.batch([
    buildSetNoteRetiredStatement(db, { noteId: note.id, venueId: venue.id, retired }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: params.retire ? 'venue-note.retired' : 'venue-note.restored',
      entityType: 'venue-note',
      entityId: note.id,
      before: note,
    }),
  ]);
}
