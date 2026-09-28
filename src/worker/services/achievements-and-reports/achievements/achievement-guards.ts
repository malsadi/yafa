import { ConflictError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { listPeopleWhoServedIn } from '../../committee-register';
import { findAchievement } from './achievements.repo';
import type { AchievementInput } from './achievements.schema';

/**
 * D-215 (O-151): a date up to today, a category from the list, and officers
 * who have held a term in the unit, past officers included. A change may
 * keep the category it had, even if since retired from the list (D-213 choice).
 */
export async function requireValidAchievement(
  db: D1Database,
  unitId: string,
  input: AchievementInput,
  keptCategoryId: string | null = null,
): Promise<void> {
  if (input.date > getTodayInLondon())
    throw new ConflictError('achievements-and-reports.future-date');
  const categories = await listChoicesOf(db, 'achievement-categories');
  if (
    input.categoryItemId !== keptCategoryId &&
    !categories.some((c) => c.id === input.categoryItemId)
  )
    throw new ConflictError('achievements-and-reports.category-not-in-list');
  const served = new Set((await listPeopleWhoServedIn(db, [unitId])).map((p) => p.personId));
  if (!input.officerPersonIds.every((id) => served.has(id)))
    throw new ConflictError('achievements-and-reports.not-an-officer');
}

/** One of the unit's achievements, still open to change (O-152). */
export async function requireOpenAchievement(
  db: D1Database,
  unitId: string,
  achievementId: string,
) {
  const found = await findAchievement(db, unitId, achievementId);
  if (!found) throw new NotFoundError('achievements-and-reports.achievement-not-found');
  if (found.locked) throw new ConflictError('achievements-and-reports.locked');
  return found;
}
