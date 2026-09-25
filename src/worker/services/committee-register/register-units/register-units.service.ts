import type { UnitRecord } from '../../../../shared/committee-register/unit-record';
import { can, type RequestContext } from '../../../core/permissions';
import { listUnits } from '../branches/branches.repo';

/** Whether this person may read a unit's register — the rule of `requireRegisterReader`. */
async function readsRegisterOf(db: D1Database, ctx: RequestContext, unitId: string) {
  return (
    (await can(db, ctx, 'committee-register.register.read', { unitId })) ||
    can(db, ctx, 'committee-register.officers.manage', { unitId })
  );
}

/**
 * Brief 14: the units whose register this person may open — their own for
 * a branch register officer or reader, every one for the national register
 * officer. Only units they may read are listed, never the others' names.
 */
export async function listRegisterUnits(
  db: D1Database,
  ctx: RequestContext,
): Promise<UnitRecord[]> {
  const units = await listUnits(db);
  const readable = await Promise.all(units.map((unit) => readsRegisterOf(db, ctx, unit.id)));
  return units.filter((_, index) => readable[index]);
}
