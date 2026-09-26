import type { EquipmentRecord } from '../../../../shared/resources-library/equipment';
import type { EquipmentDetailsInput } from './equipment.schema';

export type EquipmentRow = Omit<EquipmentRecord, 'national' | 'loans'>;

const SELECT = `SELECT e.id, e.unit_id AS unitId, e.item, e.quantity, e.location,
    e.condition_id AS conditionId, c.name_en AS conditionNameEn, c.name_ar AS conditionNameAr,
    e.retired_at AS retiredAt, e.version,
    (SELECT COALESCE(SUM(l.quantity), 0) FROM library_equipment_loans l
      WHERE l.equipment_id = e.id AND l.returned_on IS NULL) AS outOnLoan
  FROM library_equipment e JOIN list_items c ON c.id = e.condition_id`;

export async function listEquipmentOf(db: D1Database, unitIds: string[]): Promise<EquipmentRow[]> {
  const marks = unitIds.map(() => '?').join(', ');
  const result = await db
    .prepare(`${SELECT} WHERE e.unit_id IN (${marks}) ORDER BY e.item`)
    .bind(...unitIds)
    .all<EquipmentRow>();
  return result.results;
}

export async function findEquipment(
  db: D1Database,
  equipmentId: string,
): Promise<EquipmentRow | null> {
  return db.prepare(`${SELECT} WHERE e.id = ?`).bind(equipmentId).first<EquipmentRow>();
}

export function buildInsertEquipmentStatement(
  db: D1Database,
  row: EquipmentDetailsInput & { id: string; unitId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO library_equipment (id, unit_id, item, quantity, location, condition_id,
         retired_at, version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.item,
      row.quantity,
      row.location,
      row.conditionId,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change from `version` (9.1); the trigger also refuses a quantity below what is out (D-108). */
export function buildUpdateEquipmentStatement(
  db: D1Database,
  change: EquipmentDetailsInput & { id: string; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE library_equipment SET item = ?, quantity = ?, location = ?, condition_id = ?,
         version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      change.item,
      change.quantity,
      change.location,
      change.conditionId,
      change.version + 1,
      change.actor,
      change.at,
      change.id,
    );
}
