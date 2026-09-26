import type { EquipmentView } from '../../../../shared/resources-library/equipment';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { requireLibraryCapability, requireWritable } from '../library-access';
import { runLibraryBatch } from '../library-versioning';
import { libraryView } from '../library-view';
import {
  buildInsertEquipmentStatement,
  buildUpdateEquipmentStatement,
  findEquipment,
  listEquipmentOf,
  type EquipmentRow,
} from './equipment.repo';
import type { EquipmentDetailsInput } from './equipment.schema';
import { listLoansOf } from './loans.repo';

export const MANAGE = 'resources-library.equipment.manage';

/**
 * Brief 16 C1, C2 and D-106: the unit's equipment and the General
 * Council's, with how many are out on loan. Who borrowed what is shown for
 * the unit's own items only (O-059).
 */
export async function listEquipment(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<EquipmentView> {
  const view = await libraryView(db, ctx, unitId, MANAGE);
  const items = (await listEquipmentOf(db, view.unitIds)).filter(view.shows);
  const own = items.filter((item) => item.unitId === view.unit.id);
  const loans = await listLoansOf(
    db,
    own.map((item) => item.id),
  );
  const conditions = (await listChoicesOf(db, 'equipment-conditions')).map(
    ({ id, nameEn, nameAr }) => ({ id, nameEn, nameAr }),
  );
  return {
    items: items.map((item) => ({
      ...item,
      national: view.isNational(item.unitId),
      loans:
        item.unitId === view.unit.id ? loans.filter((loan) => loan.equipmentId === item.id) : null,
    })),
    conditions,
  };
}

/** An item of this unit, which the officer manages there (P4); another unit's is not found. */
export async function requireManagedEquipment(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; equipmentId: string },
): Promise<EquipmentRow> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, params.unitId));
  const item = await findEquipment(db, params.equipmentId);
  if (item?.unitId !== params.unitId)
    throw new NotFoundError('resources-library.equipment-not-found');
  return item;
}

/** 15 B3 and D-114: none, a condition offered by the list, or the one the item already has. */
async function requireCondition(
  db: D1Database,
  conditionId: string | null,
  current?: string | null,
): Promise<void> {
  if (conditionId === null || conditionId === current) return;
  const offered = await listChoicesOf(db, 'equipment-conditions');
  if (!offered.some((c) => c.id === conditionId))
    throw new ConflictError('resources-library.condition-not-offered');
}

/** Brief 16 C1: add an item to the unit's register. */
export async function createEquipment(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: EquipmentDetailsInput,
): Promise<{ id: string }> {
  requireWritable(await requireLibraryCapability(db, ctx, MANAGE, unitId));
  await requireCondition(db, input.conditionId);
  const row = {
    ...input,
    id: generateId(),
    unitId,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await runLibraryBatch(db, [
    buildInsertEquipmentStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'equipment.added',
      entityType: 'equipment',
      entityId: row.id,
      after: input,
    }),
  ]);
  return { id: row.id };
}

/** Brief 16 C1 and D-108: change an item, never to fewer than are out on loan (9.1: from the version read). */
export async function changeEquipment(
  db: D1Database,
  ctx: RequestContext,
  params: {
    unitId: string;
    equipmentId: string;
    version: number;
    equipment: EquipmentDetailsInput;
  },
): Promise<void> {
  const before = await requireManagedEquipment(db, ctx, params);
  await requireCondition(db, params.equipment.conditionId, before.conditionId);
  if (params.equipment.quantity < before.outOnLoan) {
    throw new ConflictError('resources-library.below-loans', {
      quantity: params.equipment.quantity,
      out: before.outOnLoan,
    });
  }
  await runLibraryBatch(db, [
    buildUpdateEquipmentStatement(db, {
      ...params.equipment,
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'equipment.changed',
      entityType: 'equipment',
      entityId: before.id,
      before,
      after: params.equipment,
    }),
  ]);
}
