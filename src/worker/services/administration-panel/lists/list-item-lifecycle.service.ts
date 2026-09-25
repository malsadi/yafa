import type { ListKey } from '../../../../shared/administration-panel/lists';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireListsCapability } from './lists-guards';
import {
  buildPositionStatement,
  buildRestoreListItemStatement,
  buildRetireListItemStatement,
  findListItem,
  listItemsOf,
} from './lists.repo';

/**
 * D-070: retire an item. It is hidden from new choices and kept, so past
 * records still read correctly; nothing ever deletes it (a trigger refuses).
 * D-078: it can be brought back.
 */
export async function retireListItem(
  db: D1Database,
  ctx: RequestContext,
  params: { list: ListKey; itemId: string },
): Promise<void> {
  await requireListsCapability(db, ctx);
  const item = await findListItem(db, params.list, params.itemId);
  if (!item) throw new NotFoundError('lists.item-not-found');
  if (item.retiredAt) throw new ConflictError('lists.item-already-retired');
  await db.batch([
    buildRetireListItemStatement(db, item.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'list-item.retired',
      entityType: 'list_item',
      entityId: item.id,
      before: item,
    }),
  ]);
}

/** D-078: bring a retired item back, so it is offered for new records again. */
export async function restoreListItem(
  db: D1Database,
  ctx: RequestContext,
  params: { list: ListKey; itemId: string },
): Promise<void> {
  await requireListsCapability(db, ctx);
  const item = await findListItem(db, params.list, params.itemId);
  if (!item) throw new NotFoundError('lists.item-not-found');
  if (!item.retiredAt) throw new ConflictError('lists.item-not-retired');
  await db.batch([
    buildRestoreListItemStatement(db, item.id),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'list-item.restored',
      entityType: 'list_item',
      entityId: item.id,
      before: item,
      after: { ...item, retiredAt: null },
    }),
  ]);
}

/**
 * D-071: put a list in the administrator's order. `itemIds` must name every
 * item of the list exactly once, retired ones included, so no position is
 * lost or shared.
 */
export async function orderList(
  db: D1Database,
  ctx: RequestContext,
  params: { list: ListKey; itemIds: string[] },
): Promise<void> {
  await requireListsCapability(db, ctx);
  const items = await listItemsOf(db, params.list);
  const known = new Set(items.map((item) => item.id));
  const given = new Set(params.itemIds);
  if (
    given.size !== params.itemIds.length ||
    given.size !== known.size ||
    ![...given].every((id) => known.has(id))
  ) {
    throw new ConflictError('lists.order-must-name-every-item');
  }
  await db.batch([
    ...params.itemIds.map((id, index) => buildPositionStatement(db, id, index + 1)),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'list.ordered',
      entityType: 'list',
      entityId: params.list,
      before: items.map((item) => item.id),
      after: params.itemIds,
    }),
  ]);
}
