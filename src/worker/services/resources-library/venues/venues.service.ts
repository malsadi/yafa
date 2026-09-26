import type { VenueRecord } from '../../../../shared/resources-library/venue';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireLibraryCapability, requireWritable } from '../library-access';
import { runLibraryBatch } from '../library-versioning';
import { libraryView } from '../library-view';
import {
  buildInsertVenueStatement,
  buildUpdateVenueStatement,
  findVenue,
  listNotesOf,
  listVenuesOf,
  type VenueRow,
} from './venues.repo';
import type { VenueDetailsInput } from './venues.schema';

export const MANAGE = 'resources-library.venues.manage';

/**
 * Brief 16 B1 and D-106: the unit's venues and the General Council's, with
 * their notes — a retired note only to the venue's managers (D-114).
 */
export async function listVenues(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<VenueRecord[]> {
  const view = await libraryView(db, ctx, unitId, MANAGE);
  const venues = (await listVenuesOf(db, view.unitIds)).filter(view.shows);
  const notes = await listNotesOf(
    db,
    venues.map((v) => v.id),
  );
  return venues.map((venue) => ({
    ...venue,
    national: view.isNational(venue.unitId),
    notes: notes
      .filter((note) => note.venueId === venue.id)
      .filter((note) => view.shows({ unitId: venue.unitId, retiredAt: note.retiredAt }))
      .map((note) => ({
        id: note.id,
        text: note.text,
        writtenByName: note.writtenByName,
        writtenAt: note.writtenAt,
        retiredAt: note.retiredAt,
      })),
  }));
}

/** A venue of this unit, which the officer manages there (P4); another unit's is not found. */
export async function requireManagedVenue(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; venueId: string },
): Promise<VenueRow> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, params.unitId));
  const venue = await findVenue(db, params.venueId);
  if (venue?.unitId !== params.unitId) throw new NotFoundError('resources-library.venue-not-found');
  return venue;
}

/** Brief 16 B1 and D-105: record a venue — perhaps before all its details are known. */
export async function createVenue(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  venue: VenueDetailsInput,
): Promise<{ id: string }> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, unitId));
  const row = {
    ...venue,
    id: generateId(),
    unitId,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await runLibraryBatch(db, [
    buildInsertVenueStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'venue.added',
      entityType: 'venue',
      entityId: row.id,
      after: venue,
    }),
  ]);
  return { id: row.id };
}

/** Brief 16 B1: change a venue's details, from the version read (9.1). */
export async function changeVenue(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; venueId: string; version: number; venue: VenueDetailsInput },
): Promise<void> {
  const before = await requireManagedVenue(db, ctx, params);
  await runLibraryBatch(db, [
    buildUpdateVenueStatement(db, {
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
      venue: params.venue,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'venue.changed',
      entityType: 'venue',
      entityId: before.id,
      before,
      after: params.venue,
    }),
  ]);
}
