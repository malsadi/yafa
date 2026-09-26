/** D-098 and D-107: a note from past use — who wrote it and when; never changed. */
export interface VenueNoteRecord {
  id: string;
  text: string;
  writtenByName: string | null;
  writtenAt: string;
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
  /** The notes still showing, the latest first. */
  notes: VenueNoteRecord[];
}
