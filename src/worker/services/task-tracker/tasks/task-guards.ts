import { ConflictError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { listCurrentOfficersOf } from '../../committee-register';
import { findTask, type TaskRow } from './tasks.repo';

/** A task of this unit's; another unit's is not found. */
export async function requireUnitTask(
  db: D1Database,
  unitId: string,
  taskId: string,
): Promise<TaskRow> {
  const task = await findTask(db, taskId);
  if (task?.unitId !== unitId) throw new NotFoundError('task-tracker.task-not-found');
  return task;
}

/** D-139: an owner is one of the unit's current officers — or the one the task already has. */
export async function requireOwner(
  db: D1Database,
  unitId: string,
  ownerPersonId: string,
  current?: string,
): Promise<void> {
  if (ownerPersonId === current) return;
  const officers = await listCurrentOfficersOf(db, unitId, getTodayInLondon());
  if (!officers.some((o) => o.personId === ownerPersonId))
    throw new ConflictError('task-tracker.owner-not-an-officer');
}

/** Runs a task's batch; a save made from an older version is refused (9.1). */
export async function runTaskBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale'))
      throw new ConflictError('task-tracker.stale');
    throw error;
  }
}
