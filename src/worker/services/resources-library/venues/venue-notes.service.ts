import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { buildInsertNoteStatement, buildRetireNoteStatement } from './venues.repo';
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
 * D-107: retire a note so it stops showing — never changed or deleted; who
 * retired it and when is recorded with it, and in the audit log.
 */
export async function retireVenueNote(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; venueId: string; noteId: string },
): Promise<void> {
  const venue = await requireManagedVenue(db, ctx, params);
  const note = await db
    .prepare(
      'SELECT id FROM library_venue_notes WHERE id = ? AND venue_id = ? AND retired_at IS NULL',
    )
    .bind(params.noteId, venue.id)
    .first<{ id: string }>();
  if (!note) throw new NotFoundError('resources-library.venue-note-not-found');
  const at = new Date().toISOString();
  await db.batch([
    buildRetireNoteStatement(db, { noteId: note.id, venueId: venue.id, actor: ctx.personId, at }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'venue-note.retired',
      entityType: 'venue-note',
      entityId: note.id,
    }),
  ]);
}
