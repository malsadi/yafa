import type {
  ArchiveCategory,
  ListItem,
  ListKey,
} from '../../../../shared/administration-panel/lists';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { can, type RequestContext } from '../../../core/permissions';
import {
  buildInsertListItemStatement,
  buildRenameListItemStatement,
  findListItem,
  listAllItems,
  listArchiveCategories,
  listItemsOf,
} from './lists.repo';
import type { AddListItemInput, RenameListItemInput } from './lists.schema';

const CAPABILITY = 'administration-panel.lists.manage';

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** No two items of one list share a name, in either language. */
function requireUniqueName(
  items: ListItem[],
  names: { nameEn: string; nameAr: string },
  exceptId?: string,
) {
  const clash = items.some(
    (item) =>
      item.id !== exceptId &&
      (item.nameEn.toLowerCase() === names.nameEn.toLowerCase() || item.nameAr === names.nameAr),
  );
  if (clash) throw new ConflictError('lists.name-taken');
}

/** Brief 25 B3: every list and its items, and the fixed archive categories. */
export async function getLists(
  db: D1Database,
  ctx: RequestContext,
): Promise<{ items: ListItem[]; archiveCategories: ArchiveCategory[] }> {
  await requireCapability(db, ctx);
  const [items, archiveCategories] = await Promise.all([
    listAllItems(db),
    listArchiveCategories(db),
  ]);
  return { items, archiveCategories };
}

export async function addListItem(
  db: D1Database,
  ctx: RequestContext,
  list: ListKey,
  input: AddListItemInput,
): Promise<ListItem> {
  await requireCapability(db, ctx);
  requireUniqueName(await listItemsOf(db, list), input);
  const item: ListItem = { id: generateId(), list, ...input };
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
  await requireCapability(db, ctx);
  const item = await findListItem(db, params.list, params.itemId);
  if (!item) throw new NotFoundError('lists.item-not-found');
  const after: ListItem = { ...item, ...params.changes };
  requireUniqueName(await listItemsOf(db, params.list), after, item.id);
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
