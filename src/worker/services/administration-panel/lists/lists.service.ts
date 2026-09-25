import type {
  ArchiveCategory,
  ListItem,
  ListKey,
} from '../../../../shared/administration-panel/lists';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireColourFits, requireListsCapability, requireUniqueName } from './lists-guards';
import {
  buildInsertListItemStatement,
  buildRenameListItemStatement,
  findListItem,
  listAllItems,
  listArchiveCategories,
  listItemsOf,
} from './lists.repo';
import type { AddListItemInput, RenameListItemInput } from './lists.schema';

/** Brief 25 B3: every list and its items, retired ones marked (D-070), and the fixed archive categories. */
export async function getLists(
  db: D1Database,
  ctx: RequestContext,
): Promise<{ items: ListItem[]; archiveCategories: ArchiveCategory[] }> {
  await requireListsCapability(db, ctx);
  const [items, archiveCategories] = await Promise.all([
    listAllItems(db),
    listArchiveCategories(db),
  ]);
  return { items, archiveCategories };
}

/** Brief 25 B3 and D-071: a new item, last in its list. */
export async function addListItem(
  db: D1Database,
  ctx: RequestContext,
  list: ListKey,
  input: AddListItemInput,
): Promise<ListItem> {
  await requireListsCapability(db, ctx);
  requireUniqueName(await listItemsOf(db, list), input);
  requireColourFits(list, input.colour ?? null);
  const current = await listItemsOf(db, list);
  const item: ListItem = {
    id: generateId(),
    list,
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    colour: input.colour ?? null,
    position: current.length + 1,
    retiredAt: null,
  };
  await db.batch([
    buildInsertListItemStatement(db, item),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'list-item.added',
      entityType: 'list_item',
      entityId: item.id,
      after: item,
    }),
  ]);
  return item;
}

export async function renameListItem(
  db: D1Database,
  ctx: RequestContext,
  params: { list: ListKey; itemId: string; changes: RenameListItemInput },
): Promise<ListItem> {
  await requireListsCapability(db, ctx);
  const item = await findListItem(db, params.list, params.itemId);
  if (!item) throw new NotFoundError('lists.item-not-found');
  const after: ListItem = { ...item, ...params.changes };
  requireUniqueName(await listItemsOf(db, params.list), after, item.id);
  requireColourFits(params.list, after.colour);
  await db.batch([
    buildRenameListItemStatement(db, after),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'list-item.renamed',
      entityType: 'list_item',
      entityId: item.id,
      before: item,
      after,
    }),
  ]);
  return after;
}
