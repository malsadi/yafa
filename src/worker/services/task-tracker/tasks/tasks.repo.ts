import type { TaskRecord } from '../../../../shared/task-tracker/task-records';
import type { ActionListFilters, TaskChange, TaskDetails } from './tasks.schema';

export type TaskRow = Omit<TaskRecord, 'dueSoon' | 'overdue'>;

const SELECT = `SELECT t.id, t.unit_id AS unitId, u.name_en AS unitNameEn, u.name_ar AS unitNameAr,
    t.event_id AS eventId, t.title, t.description, t.owner_person_id AS ownerPersonId, p.name AS ownerName,
    t.due_date AS dueDate, t.status, t.version
  FROM tasks t JOIN units u ON u.id = t.unit_id LEFT JOIN people p ON p.id = t.owner_person_id`;

/** Brief 18 B2: a unit's tasks, filtered by owner, status or event, soonest due first. */
export async function listUnitTasks(
  db: D1Database,
  unitId: string,
  filters: ActionListFilters,
): Promise<TaskRow[]> {
  const conditions: [string, string][] = [['t.unit_id = ?', unitId]];
  if (filters.ownerPersonId) conditions.push(['t.owner_person_id = ?', filters.ownerPersonId]);
  if (filters.status) conditions.push(['t.status = ?', filters.status]);
  if (filters.eventId) conditions.push(['t.event_id = ?', filters.eventId]);
  const result = await db
    .prepare(
      `${SELECT} WHERE ${conditions.map(([sql]) => sql).join(' AND ')} ORDER BY t.due_date, t.title`,
    )
    .bind(...conditions.map(([, value]) => value))
    .all<TaskRow>();
  return result.results;
}

/** Brief 18 B1: an officer's own tasks in these units, soonest due first. */
export async function listOwnedTasks(
  db: D1Database,
  personId: string,
  unitIds: string[],
): Promise<TaskRow[]> {
  if (unitIds.length === 0) return [];
  const marks = unitIds.map(() => '?').join(', ');
  const result = await db
    .prepare(
      `${SELECT} WHERE t.owner_person_id = ? AND t.unit_id IN (${marks}) ORDER BY t.due_date, t.title`,
    )
    .bind(personId, ...unitIds)
    .all<TaskRow>();
  return result.results;
}

export async function findTask(db: D1Database, taskId: string): Promise<TaskRow | null> {
  return db.prepare(`${SELECT} WHERE t.id = ?`).bind(taskId).first<TaskRow>();
}

export function buildInsertTaskStatement(
  db: D1Database,
  row: TaskDetails & { id: string; unitId: string; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO tasks (id, unit_id, event_id, title, description, owner_person_id, due_date, status,
         version, created_by, created_at, updated_by, updated_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, 'To do', 1, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.unitId,
      row.title,
      row.description,
      row.ownerPersonId,
      row.dueDate,
      row.actor,
      row.at,
      row.actor,
      row.at,
    );
}

/** A change from `version`; the trigger refuses it unless the stored version is still `version` (9.1). */
export function buildUpdateTaskStatement(
  db: D1Database,
  change: TaskChange & { id: string; version: number; actor: string; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      `UPDATE tasks SET title = ?, description = ?, owner_person_id = ?, due_date = ?, status = ?,
         version = ?, updated_by = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      change.title,
      change.description,
      change.ownerPersonId,
      change.dueDate,
      change.status,
      change.version + 1,
      change.actor,
      change.at,
      change.id,
    );
}
