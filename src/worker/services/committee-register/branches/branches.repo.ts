import { asc, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { units } from '../../../../db/schema/committee-register/units';
import type { UnitRecord, UpdateUnitInput } from './branches.schema';

const COLUMNS = {
  id: units.id,
  type: units.type,
  code: units.code,
  nameEn: units.nameEn,
  nameAr: units.nameAr,
  area: units.area,
  status: units.status,
  letterheadAddressEn: units.letterheadAddressEn,
  letterheadAddressAr: units.letterheadAddressAr,
  calendarColourId: units.calendarColourId,
};

/** The General Council first, then the branches by English name. */
export async function listUnits(db: D1Database): Promise<UnitRecord[]> {
  return drizzle(db).select(COLUMNS).from(units).orderBy(desc(units.type), asc(units.nameEn));
}

export async function findUnit(db: D1Database, unitId: string): Promise<UnitRecord | null> {
  const rows = await drizzle(db).select(COLUMNS).from(units).where(eq(units.id, unitId)).limit(1);
  return rows[0] ?? null;
}

export function buildInsertBranchStatement(db: D1Database, unit: UnitRecord): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO units (id, type, code, name_en, name_ar, area, status,
         letterhead_address_en, letterhead_address_ar, calendar_colour_id, created_at)
       VALUES (?, 'branch', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      unit.id,
      unit.code,
      unit.nameEn,
      unit.nameAr,
      unit.area,
      unit.status,
      unit.letterheadAddressEn,
      unit.letterheadAddressAr,
      unit.calendarColourId,
      new Date().toISOString(),
    );
}

export function buildUpdateUnitStatement(
  db: D1Database,
  unitId: string,
  changes: UpdateUnitInput,
): D1PreparedStatement {
  const columns: Record<keyof UpdateUnitInput, string> = {
    code: 'code',
    nameEn: 'name_en',
    nameAr: 'name_ar',
    area: 'area',
    status: 'status',
    letterheadAddressEn: 'letterhead_address_en',
    letterheadAddressAr: 'letterhead_address_ar',
    calendarColourId: 'calendar_colour_id',
  };
  const keys = (Object.keys(changes) as (keyof UpdateUnitInput)[]).filter(
    (key) => changes[key] !== undefined,
  );
  const assignments = keys.map((key) => `${columns[key]} = ?`).join(', ');
  return db
    .prepare(`UPDATE units SET ${assignments} WHERE id = ?`)
    .bind(...keys.map((key) => changes[key]), unitId);
}
