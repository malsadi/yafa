import { and, asc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { listItems } from '../../../../db/schema/administration-panel/list-items';
import { archiveCategories } from '../../../../db/schema/documents-archive/archive-categories';
import type {
  ArchiveCategory,
  ListItem,
  ListKey,
} from '../../../../shared/administration-panel/lists';

const COLUMNS = {
  id: listItems.id,
  list: listItems.list,
  nameEn: listItems.nameEn,
  nameAr: listItems.nameAr,
};

/** Every item of every list, oldest first within each list. */
export async function listAllItems(db: D1Database): Promise<ListItem[]> {
  return drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .orderBy(asc(listItems.list), asc(listItems.createdAt));
}

export async function listItemsOf(db: D1Database, list: ListKey): Promise<ListItem[]> {
  return drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .where(eq(listItems.list, list))
    .orderBy(asc(listItems.createdAt));
}

export async function findListItem(
  db: D1Database,
  list: ListKey,
  itemId: string,
): Promise<ListItem | null> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .where(and(eq(listItems.list, list), eq(listItems.id, itemId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listArchiveCategories(db: D1Database): Promise<ArchiveCategory[]> {
  return drizzle(db)
    .select({
      id: archiveCategories.id,
      nameEn: archiveCategories.nameEn,
      nameAr: archiveCategories.nameAr,
    })
    .from(archiveCategories)
    .orderBy(asc(archiveCategories.position));
}

export function buildInsertListItemStatement(db: D1Database, item: ListItem): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO list_items (id, list, name_en, name_ar, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(item.id, item.list, item.nameEn, item.nameAr, new Date().toISOString());
}

export function buildRenameListItemStatement(db: D1Database, item: ListItem): D1PreparedStatement {
  return db
    .prepare('UPDATE list_items SET name_en = ?, name_ar = ? WHERE id = ?')
    .bind(item.nameEn, item.nameAr, item.id);
}
