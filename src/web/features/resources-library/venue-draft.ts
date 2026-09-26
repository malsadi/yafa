import { parsePoundsToPence, penceToPoundsText } from '../../../shared/core/parse-pounds';
import type { VenueDetails } from '../../../shared/resources-library/venue';

/** A venue as written in its form: every field as typed (D-105: only the name is required). */
export type VenueDraft = Record<keyof VenueDetails, string>;

export const EMPTY_VENUE: VenueDraft = {
  name: '',
  address: '',
  capacity: '',
  facilities: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  typicalCostPence: '',
  typicalCostNote: '',
};

export function draftOf(venue: VenueDetails): VenueDraft {
  const text = (value: string | null) => value ?? '';
  return {
    name: venue.name,
    address: text(venue.address),
    capacity: venue.capacity === null ? '' : String(venue.capacity),
    facilities: text(venue.facilities),
    contactName: text(venue.contactName),
    contactPhone: text(venue.contactPhone),
    contactEmail: text(venue.contactEmail),
    typicalCostPence:
      venue.typicalCostPence === null ? '' : penceToPoundsText(venue.typicalCostPence),
    typicalCostNote: text(venue.typicalCostNote),
  };
}

/** The draft as details to save — the cost, written in pounds, as pence (9.1); null if it can't be read. */
export function detailsOf(draft: VenueDraft): VenueDetails | null {
  const optional = (value: string) => (value.trim() === '' ? null : value.trim());
  const cost = draft.typicalCostPence.trim();
  const pence = cost === '' ? null : parsePoundsToPence(cost);
  if (cost !== '' && pence === null) return null;
  return {
    name: draft.name.trim(),
    address: optional(draft.address),
    capacity: draft.capacity.trim() === '' ? null : Number(draft.capacity),
    facilities: optional(draft.facilities),
    contactName: optional(draft.contactName),
    contactPhone: optional(draft.contactPhone),
    contactEmail: optional(draft.contactEmail),
    typicalCostPence: pence,
    typicalCostNote: optional(draft.typicalCostNote),
  };
}
