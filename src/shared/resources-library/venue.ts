/** D-098, D-107 and D-114: a note from past use — who wrote it and when; never changed. */
export interface VenueNoteRecord {
  id: string;
  text: string;
  writtenByName: string | null;
  writtenAt: string;
  /** Retired, it no longer shows — except to those who can bring it back (D-114). */
  retiredAt: string | null;
}

/** Brief 16 B1 and D-105: a venue's details; only the name is required. */
export interface VenueDetails {
  name: string;
  address: string | null;
  capacity: number | null;
  facilities: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  /** Integer pence (9.1). */
  typicalCostPence: number | null;
  typicalCostNote: string | null;
}

export interface VenueRecord extends VenueDetails {
  id: string;
  unitId: string;
  /** The General Council's, shared with every branch (D-106). */
  national: boolean;
  retiredAt: string | null;
  version: number;
  /** The notes showing, the latest first; retired ones only to the venue's managers. */
  notes: VenueNoteRecord[];
}
