import { and, asc, eq, isNull } from 'drizzle-orm';
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
  position: listItems.position,
  retiredAt: listItems.retiredAt,
  colour: listItems.colour,
};

/** Every item of every list, retired ones included, in the administrator's order (D-071). */
export async function listAllItems(db: D1Database): Promise<ListItem[]> {
  return drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .orderBy(asc(listItems.list), asc(listItems.position));
}

/** One list's items, retired ones included, in order. */
export async function listItemsOf(db: D1Database, list: ListKey): Promise<ListItem[]> {
  return drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .where(eq(listItems.list, list))
    .orderBy(asc(listItems.position));
}

/** D-070: what a new record may choose from — a list's items not retired, in order. */
export async function listChoicesOf(db: D1Database, list: ListKey): Promise<ListItem[]> {
  return drizzle(db)
    .select(COLUMNS)
    .from(listItems)
    .where(and(eq(listItems.list, list), isNull(listItems.retiredAt)))
    .orderBy(asc(listItems.position));
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

/** A new item goes last in its list; its position is worked out in SQL (build rule 6). */
export function buildInsertListItemStatement(
  db: D1Database,
  item: Pick<ListItem, 'id' | 'list' | 'nameEn' | 'nameAr' | 'colour'>,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO list_items (id, list, name_en, name_ar, position, colour, created_at)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM list_items WHERE list = ?), ?, ?)`,
    )
    .bind(
      item.id,
      item.list,
      item.nameEn,
      item.nameAr,
      item.list,
      item.colour,
      new Date().toISOString(),
    );
}

export function buildRenameListItemStatement(db: D1Database, item: ListItem): D1PreparedStatement {
  return db
    .prepare('UPDATE list_items SET name_en = ?, name_ar = ?, colour = ? WHERE id = ?')
    .bind(item.nameEn, item.nameAr, item.colour, item.id);
}

export function buildRetireListItemStatement(db: D1Database, itemId: string): D1PreparedStatement {
  return db
    .prepare('UPDATE list_items SET retired_at = ? WHERE id = ? AND retired_at IS NULL')
    .bind(new Date().toISOString(), itemId);
}

export function buildRestoreListItemStatement(db: D1Database, itemId: string): D1PreparedStatement {
  return db
    .prepare('UPDATE list_items SET retired_at = NULL WHERE id = ? AND retired_at IS NOT NULL')
    .bind(itemId);
}

export function buildPositionStatement(
  db: D1Database,
  itemId: string,
  position: number,
): D1PreparedStatement {
  return db.prepare('UPDATE list_items SET position = ? WHERE id = ?').bind(position, itemId);
}
