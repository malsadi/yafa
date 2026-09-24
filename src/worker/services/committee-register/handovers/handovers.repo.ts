import { asc, desc, eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { handoverItems, handovers } from '../../../../db/schema/committee-register/handovers';
import { generateId } from '../../../core/ids';
import type { HandoverItem, HandoverRecord } from './handovers.schema';

type HandoverRow = Omit<HandoverRecord, 'items'>;

const COLUMNS = {
  id: handovers.id,
  unitId: handovers.unitId,
  roleId: handovers.roleId,
  outgoingPersonId: handovers.outgoingPersonId,
  incomingPersonId: handovers.incomingPersonId,
  outgoingConfirmedAt: handovers.outgoingConfirmedAt,
  incomingConfirmedAt: handovers.incomingConfirmedAt,
};

async function withItems(db: D1Database, rows: HandoverRow[]): Promise<HandoverRecord[]> {
  if (rows.length === 0) return [];
  const items = await drizzle(db)
    .select({
      id: handoverItems.id,
      handoverId: handoverItems.handoverId,
      nameEn: handoverItems.nameEn,
      nameAr: handoverItems.nameAr,
      tickedAt: handoverItems.tickedAt,
    })
    .from(handoverItems)
    .where(
      inArray(
        handoverItems.handoverId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(asc(handoverItems.createdAt));
  return rows.map((row) => ({
    ...row,
    items: items
      .filter((item) => item.handoverId === row.id)
      .map((item) => ({
        id: item.id,
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        tickedAt: item.tickedAt,
      })),
  }));
}

export async function listUnitHandovers(db: D1Database, unitId: string): Promise<HandoverRecord[]> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(handovers)
    .where(eq(handovers.unitId, unitId))
    .orderBy(desc(handovers.createdAt));
  return withItems(db, rows);
}

export async function findHandover(
  db: D1Database,
  handoverId: string,
): Promise<HandoverRecord | null> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(handovers)
    .where(eq(handovers.id, handoverId))
    .limit(1);
  return (await withItems(db, rows))[0] ?? null;
}

export function buildInsertHandoverStatement(
  db: D1Database,
  handover: HandoverRow,
  createdBy: string,
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO handovers (id, unit_id, role_id, outgoing_person_id, incoming_person_id, created_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      handover.id,
      handover.unitId,
      handover.roleId,
      handover.outgoingPersonId,
      handover.incomingPersonId,
      new Date().toISOString(),
      createdBy,
    );
}

export function buildInsertItemStatement(
  db: D1Database,
  handoverId: string,
  item: { nameEn: string; nameAr: string },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO handover_items (id, handover_id, name_en, name_ar, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(generateId(), handoverId, item.nameEn, item.nameAr, new Date().toISOString());
}

export function buildRemoveItemStatement(db: D1Database, itemId: string): D1PreparedStatement {
  return db.prepare('DELETE FROM handover_items WHERE id = ?').bind(itemId);
}

export function buildTickItemStatement(
  db: D1Database,
  itemId: string,
  tickedBy: string | null,
): D1PreparedStatement {
  return db
    .prepare('UPDATE handover_items SET ticked_at = ?, ticked_by = ? WHERE id = ?')
    .bind(tickedBy ? new Date().toISOString() : null, tickedBy, itemId);
}

export function buildConfirmStatement(
  db: D1Database,
  handoverId: string,
  side: 'outgoing' | 'incoming',
): D1PreparedStatement {
  const column = side === 'outgoing' ? 'outgoing_confirmed_at' : 'incoming_confirmed_at';
  return db
    .prepare(`UPDATE handovers SET ${column} = ? WHERE id = ? AND ${column} IS NULL`)
    .bind(new Date().toISOString(), handoverId);
}

export type { HandoverItem };

/** Whether a person has ever held a term in the unit (brief 14 C2's two officers). */
export async function hasTermInUnit(
  db: D1Database,
  personId: string,
  unitId: string,
): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 FROM terms WHERE person_id = ? AND unit_id = ? LIMIT 1')
    .bind(personId, unitId)
    .first();
  return row !== null;
}
