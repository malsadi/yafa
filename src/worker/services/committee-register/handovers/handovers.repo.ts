import { asc, desc, eq, inArray, or, type SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { alias } from 'drizzle-orm/sqlite-core';
import { handoverItems, handovers } from '../../../../db/schema/committee-register/handovers';
import { people } from '../../../../db/schema/committee-register/people';
import { roles } from '../../../../db/schema/committee-register/roles';
import { units } from '../../../../db/schema/committee-register/units';
import { generateId } from '../../../core/ids';
import type { HandoverItem, HandoverRecord, NewHandover } from './handovers.schema';

type HandoverRow = Omit<HandoverRecord, 'items'>;

const outgoing = alias(people, 'outgoing');
const incoming = alias(people, 'incoming');

const COLUMNS = {
  id: handovers.id,
  unitId: handovers.unitId,
  unitNameEn: units.nameEn,
  unitNameAr: units.nameAr,
  roleId: handovers.roleId,
  roleNameEn: roles.nameEn,
  roleNameAr: roles.nameAr,
  outgoingPersonId: handovers.outgoingPersonId,
  outgoingName: outgoing.name,
  incomingPersonId: handovers.incomingPersonId,
  incomingName: incoming.name,
  outgoingConfirmedAt: handovers.outgoingConfirmedAt,
  incomingConfirmedAt: handovers.incomingConfirmedAt,
};

/** Handovers matching `where`, newest first, with their names and checklists. */
async function selectHandovers(db: D1Database, where: SQL | undefined): Promise<HandoverRecord[]> {
  const rows = await drizzle(db)
    .select(COLUMNS)
    .from(handovers)
    .innerJoin(units, eq(units.id, handovers.unitId))
    .innerJoin(roles, eq(roles.id, handovers.roleId))
    .innerJoin(outgoing, eq(outgoing.id, handovers.outgoingPersonId))
    .innerJoin(incoming, eq(incoming.id, handovers.incomingPersonId))
    .where(where)
    .orderBy(desc(handovers.createdAt));
  return withItems(db, rows);
}

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

export function listUnitHandovers(db: D1Database, unitId: string): Promise<HandoverRecord[]> {
  return selectHandovers(db, eq(handovers.unitId, unitId));
}

/** The handovers a person is named on, outgoing or incoming, in any unit. */
export function listPersonHandovers(db: D1Database, personId: string): Promise<HandoverRecord[]> {
  return selectHandovers(
    db,
    or(eq(handovers.outgoingPersonId, personId), eq(handovers.incomingPersonId, personId)),
  );
}

export async function findHandover(
  db: D1Database,
  handoverId: string,
): Promise<HandoverRecord | null> {
  return (await selectHandovers(db, eq(handovers.id, handoverId)))[0] ?? null;
}

export function buildInsertHandoverStatement(
  db: D1Database,
  handover: NewHandover,
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
