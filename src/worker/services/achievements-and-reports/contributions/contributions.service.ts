import type { Contribution } from '../../../../shared/achievements-and-reports/achievement-records';
import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { listPeopleWhoServedIn, listTermsOfPerson } from '../../committee-register';
import {
  READ,
  requireAchievementCapability,
  visibleUnitIds,
  type AchievementUnitRow,
} from '../achievement-access';
import { listAchievementsCreditedTo } from '../achievements/achievements.repo';

/** D-215 (O-153): a branch's readers see its own; the General Council's see every unit's. */
const servedScope = (unit: AchievementUnitRow) => (unit.type === 'national' ? 'all' : [unit.id]);

/** Brief 24 B1: everyone who has served, past officers included, to open their contributions. */
export async function contributors(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<{ personId: string; name: string }[]> {
  const unit = await requireAchievementCapability(db, ctx, READ, unitId);
  return listPeopleWhoServedIn(db, servedScope(unit));
}

/** Brief 24 B1 and O-153: a person's roles held, with dates, and the achievements credited to them. */
export async function contribution(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; personId: string },
): Promise<Contribution> {
  const unit = await requireAchievementCapability(db, ctx, READ, params.unitId);
  const scope = servedScope(unit);
  const person = (await listPeopleWhoServedIn(db, scope)).find(
    (p) => p.personId === params.personId,
  );
  if (!person) throw new NotFoundError('achievements-and-reports.person-not-found');
  const achievementUnits = unit.type === 'national' ? await visibleUnitIds(db, unit) : [unit.id];
  const [terms, achievements] = await Promise.all([
    listTermsOfPerson(db, person.personId, scope),
    listAchievementsCreditedTo(db, person.personId, achievementUnits),
  ]);
  return {
    personId: person.personId,
    name: person.name,
    terms,
    achievements: achievements.map((a) => ({
      id: a.id,
      unitNameEn: a.unitNameEn,
      unitNameAr: a.unitNameAr,
      title: a.title,
      date: a.date,
      categoryNameEn: a.categoryNameEn,
      categoryNameAr: a.categoryNameAr,
    })),
  };
}
