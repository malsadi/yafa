import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import {
  RECORD,
  requireAchievementCapability,
  requireWritable,
  runAchievementBatch,
} from '../achievement-access';
import { requireOpenAchievement, requireValidAchievement } from './achievement-guards';
import {
  buildInsertAchievementStatement,
  buildOfficerStatements,
  buildSetWithdrawnStatement,
  buildUpdateAchievementStatement,
} from './achievement-statements';
import type { AchievementInput } from './achievements.schema';

async function writableUnit(db: D1Database, ctx: RequestContext, unitId: string) {
  const unit = await requireAchievementCapability(db, ctx, RECORD, unitId);
  requireWritable(unit);
  return unit;
}

const audit = (db: D1Database, ctx: RequestContext, action: string, id: string, after?: object) =>
  buildAuditStatement(db, {
    actorPersonId: ctx.personId,
    action,
    entityType: 'achievement',
    entityId: id,
    ...(after ? { after } : {}),
  });

/** Brief 24 A1: an achievement recorded as it happens, credited to the officers involved. */
export async function recordAchievement(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; achievement: AchievementInput },
): Promise<{ id: string }> {
  const unit = await writableUnit(db, ctx, params.unitId);
  await requireValidAchievement(db, unit.id, params.achievement);
  const id = generateId();
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    buildInsertAchievementStatement(db, {
      ...params.achievement,
      id,
      unitId: unit.id,
      actor: ctx.personId,
      at,
    }),
    ...buildOfficerStatements(db, id, params.achievement.officerPersonIds),
    audit(db, ctx, 'achievement.recorded', id, params.achievement),
  ]);
  return { id };
}

/** O-152: its details and officers changed, until its year's report is finalised. */
export async function changeAchievement(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; achievementId: string; achievement: AchievementInput; version: number },
): Promise<void> {
  const unit = await writableUnit(db, ctx, params.unitId);
  const before = await requireOpenAchievement(db, unit.id, params.achievementId);
  await requireValidAchievement(db, unit.id, params.achievement, before.categoryItemId);
  const at = new Date().toISOString();
  await runAchievementBatch(db, [
    buildUpdateAchievementStatement(db, {
      ...params.achievement,
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    ...buildOfficerStatements(db, before.id, params.achievement.officerPersonIds),
    audit(db, ctx, 'achievement.changed', before.id, params.achievement),
  ]);
}

/** O-152: withdrawn from the timeline, or brought back — never deleted. */
export async function setAchievementWithdrawn(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; achievementId: string; version: number; withdraw: boolean },
): Promise<void> {
  const unit = await writableUnit(db, ctx, params.unitId);
  const found = await requireOpenAchievement(db, unit.id, params.achievementId);
  if ((found.withdrawnAt !== null) === params.withdraw)
    throw new ConflictError(
      params.withdraw
        ? 'achievements-and-reports.already-withdrawn'
        : 'achievements-and-reports.not-withdrawn',
    );
  await runAchievementBatch(db, [
    buildSetWithdrawnStatement(db, {
      id: found.id,
      version: params.version,
      withdraw: params.withdraw,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    audit(db, ctx, params.withdraw ? 'achievement.withdrawn' : 'achievement.restored', found.id),
  ]);
}
