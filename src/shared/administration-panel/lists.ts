/**
 * Brief 8.2 and 25 B3: the lists the data administrator manages. They start
 * empty. The list names are the brief's; their items are data.
 */
export const LISTS = [
  'event-types',
  'meeting-types',
  'achievement-categories',
  'equipment-conditions',
  'handover-checklist-items',
  // D-076: the set each unit's calendar colour is chosen from.
  'calendar-colours',
] as const;

export type ListKey = (typeof LISTS)[number];

export interface ListItem {
  id: string;
  list: ListKey;
  nameEn: string;
  nameAr: string;
  /** D-071: the administrator's order within its list, from 1. */
  position: number;
  /** D-070: when it was hidden from new choices; never deleted. */
  retiredAt: string | null;
  /** D-076: the colour itself, `#RRGGBB`, for a calendar colour; null for any other list. */
  colour: string | null;
}

/** Brief 13 A3: the six fixed archive categories, locked, shown read-only in B3. */
export interface ArchiveCategory {
  id: string;
  nameEn: string;
  nameAr: string;
}
