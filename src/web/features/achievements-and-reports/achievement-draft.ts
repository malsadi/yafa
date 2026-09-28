import type { AchievementRecord } from '../../../shared/achievements-and-reports/achievement-records';

/** Brief 24 A1 and O-151: an achievement as it is being written. */
export interface AchievementDraft {
  title: string;
  date: string;
  categoryItemId: string;
  description: string;
  officerPersonIds: string[];
}

export const EMPTY_ACHIEVEMENT: AchievementDraft = {
  title: '',
  date: '',
  categoryItemId: '',
  description: '',
  officerPersonIds: [],
};

/** The draft for changing an achievement already recorded. */
export function draftOf(a: AchievementRecord): AchievementDraft {
  return {
    title: a.title,
    date: a.date,
    categoryItemId: a.categoryItemId,
    description: a.description,
    officerPersonIds: a.officers.map((o) => o.personId),
  };
}

/** One officer ticked or unticked. */
export function toggled(ids: readonly string[], personId: string, on: boolean): string[] {
  return on ? [...new Set([...ids, personId])] : ids.filter((id) => id !== personId);
}
