import type {
  AchievementChoices,
  AchievementRecord,
  TimelineScope,
} from '../../../../shared/achievements-and-reports/achievement-records';
import type { Page } from '../../../../shared/core/page';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { pagedQuery } from '../../../core/pagination';
import { can, type RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { listPeopleWhoServedIn, listUnits } from '../../committee-register';
import { READ, RECORD, requireAchievementCapability, visibleUnitIds } from '../achievement-access';
import {
  findAchievement,
  timelineQuery,
  withCredits,
  type AchievementRow,
} from '../achievements/achievements.repo';

/**
 * Brief 24 A2, A3 and D-215 (O-150): a timeline — the unit's own, the
 * General Council's, or (for the General Council's readers only) every
 * unit's together. Withdrawn achievements show only where the reader
 * records them, to bring them back (O-152).
 */
export async function timeline(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; scope: TimelineScope; page: number },
): Promise<Page<AchievementRecord>> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  if (params.scope === 'all' && unit.type !== 'national')
    throw new ForbiddenError('permission.denied');
  const visible = await visibleUnitIds(db, unit);
  const national = new Set(
    (await listUnits(db)).filter((u) => u.type === 'national').map((u) => u.id),
  );
  const unitIds =
    params.scope === 'unit'
      ? [unit.id]
      : params.scope === 'national'
        ? visible.filter((id) => national.has(id))
        : visible;
  const records = await can(db, ctx, RECORD, { unitId: unit.id });
  const page = await pagedQuery<AchievementRow>(
    db,
    timelineQuery(unitIds, records ? unit.id : null),
    params.page,
  );
  return { ...page, items: await withCredits(db, page.items) };
}

/** O-151: the categories to choose from (15 B3), and everyone who has served in the unit. */
export async function achievementChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<AchievementChoices> {
  const unit = await requireAchievementCapability(db, ctx, RECORD, unitId);
  const [categories, people] = await Promise.all([
    listChoicesOf(db, 'achievement-categories'),
    listPeopleWhoServedIn(db, [unit.id]),
  ]);
  return {
    categories: categories.map(({ id, nameEn, nameAr }) => ({ id, nameEn, nameAr })),
    people,
  };
}

/** One of the unit's own achievements, for changing it (O-152) — a withdrawn one only for its recorders. */
export async function achievement(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; achievementId: string },
): Promise<AchievementRecord> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  const found = await findAchievement(db, unit.id, params.achievementId);
  const shown =
    found && (found.withdrawnAt === null || (await can(db, ctx, RECORD, { unitId: unit.id })));
  if (!found || !shown) throw new NotFoundError('achievements-and-reports.achievement-not-found');
  return found;
}
