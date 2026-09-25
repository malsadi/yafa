import type { ListItem } from '../administration-panel/lists';

/** Brief 14 A1 and 25 B1: a unit — the General Council or a branch. */
export interface UnitRecord {
  id: string;
  type: 'national' | 'branch';
  code: string;
  nameEn: string;
  nameAr: string;
  area: string | null;
  status: 'active' | 'inactive';
  /** Brief 25 B1 and D-076: the letterhead address in both languages; null until entered. */
  letterheadAddressEn: string | null;
  letterheadAddressAr: string | null;
  /** D-076: an item of the calendar colours list; null until chosen. */
  calendarColourId: string | null;
}

/** What an officer enters for a branch; the General Council has no area or status. */
export interface UnitInput {
  code: string;
  nameEn: string;
  nameAr: string;
  area: string;
  status: 'active' | 'inactive';
  letterheadAddressEn: string | null;
  letterheadAddressAr: string | null;
  calendarColourId: string | null;
}

/** D-076 and D-078: a calendar colour a unit may choose, and the unit already using it. */
export interface CalendarColourChoice extends ListItem {
  usedByUnitId: string | null;
}
