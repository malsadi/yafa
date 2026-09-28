import type {
  AchievementChoices,
  AchievementRecord,
  TimelineScope,
} from '../../../../shared/achievements-and-reports/achievement-records';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { listPeopleWhoServedIn, listUnits } from '../../committee-register';
import { READ, RECORD, requireAchievementCapability, visibleUnitIds } from '../achievement-access';
import { listAchievementsOf } from '../achievements/achievements.repo';

/**
 * Brief 24 A2, A3 and D-215 (O-150): a timeline — the unit's own, the
 * General Council's, or (for the General Council's readers only) every
 * unit's together. Withdrawn achievements show only where the reader
 * records them, to bring them back (O-152).
 */
export async function timeline(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; scope: TimelineScope },
): Promise<AchievementRecord[]> {
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
  return (await listAchievementsOf(db, unitIds)).filter(
    (a) => a.withdrawnAt === null || (records && a.unitId === unit.id),
  );
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
