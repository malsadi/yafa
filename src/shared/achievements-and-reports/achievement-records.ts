/** Brief 24 A1, A2 and D-215 (O-151, O-152): an achievement, as the timeline shows it. */
export interface AchievementRecord {
  id: string;
  unitId: string;
  unitNameEn: string;
  unitNameAr: string;
  title: string;
  date: string;
  categoryItemId: string;
  categoryNameEn: string | null;
  categoryNameAr: string | null;
  description: string;
  officers: { personId: string; name: string | null }[];
  photos: { fileId: string; fileName: string }[];
  /** Withdrawn from the timeline, kept (O-152); shown only to those who record achievements. */
  withdrawnAt: string | null;
  /** Its year's report is finalised, so it can no longer change (O-152). */
  locked: boolean;
  /** 9.1: sent back with a change, so a stale one is refused. */
  version: number;
}

/** Which achievements a timeline shows (D-215): the unit's own, the General Council's, or every unit's (A3). */
export type TimelineScope = 'unit' | 'national' | 'all';

/** Brief 24 B1 and O-153: a person's terms of office and the achievements credited to them. */
export interface Contribution {
  personId: string;
  name: string | null;
  terms: {
    unitNameEn: string;
    unitNameAr: string;
    roleNameEn: string;
    roleNameAr: string;
    startDate: string;
    endDate: string | null;
  }[];
  achievements: Pick<
    AchievementRecord,
    'id' | 'unitNameEn' | 'unitNameAr' | 'title' | 'date' | 'categoryNameEn' | 'categoryNameAr'
  >[];
}

/** What an officer recording an achievement chooses from (O-151). */
export interface AchievementChoices {
  categories: { id: string; nameEn: string; nameAr: string }[];
  /** Everyone who has held a term in the unit, past officers included. */
  people: { personId: string; name: string }[];
}
