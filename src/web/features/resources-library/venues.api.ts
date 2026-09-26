import type { VenueDetails, VenueRecord } from '../../../shared/resources-library/venue';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const venuesPath = (unitId: string) => `/api/resources-library/units/${unitId}/venues`;

export function fetchVenues(request: Request, unitId: string) {
  return request<VenueRecord[]>(venuesPath(unitId));
}

export function createVenue(request: Request, unitId: string, venue: VenueDetails) {
  return request<{ id: string }>(venuesPath(unitId), { method: 'POST', body: venue });
}

export function saveVenue(
  request: Request,
  unitId: string,
  p: { venueId: string; version: number; venue: VenueDetails },
) {
  return request<undefined>(`${venuesPath(unitId)}/${p.venueId}`, {
    method: 'PUT',
    body: { version: p.version, venue: p.venue },
  });
}

export function addVenueNote(
  request: Request,
  unitId: string,
  p: { venueId: string; text: string },
) {
  return request<undefined>(`${venuesPath(unitId)}/${p.venueId}/notes`, {
    method: 'POST',
    body: { text: p.text },
  });
}

/** D-107 and D-114: retire a note, or bring it back. */
export function setVenueNoteRetired(
  request: Request,
  unitId: string,
  p: { venueId: string; noteId: string; retire: boolean },
) {
  const action = p.retire ? 'retire' : 'restore';
  return request<undefined>(`${venuesPath(unitId)}/${p.venueId}/notes/${p.noteId}/${action}`, {
    method: 'POST',
    body: {},
  });
}
