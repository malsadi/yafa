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
] as const;

export type ListKey = (typeof LISTS)[number];

export interface ListItem {
  id: string;
  list: ListKey;
  nameEn: string;
  nameAr: string;
}

/** Brief 13 A3: the six fixed archive categories, locked, shown read-only in B3. */
export interface ArchiveCategory {
  id: string;
  nameEn: string;
  nameAr: string;
}
