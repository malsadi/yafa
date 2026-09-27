import type { TaskHistoryEntry, TaskRecord } from '../../../../shared/task-tracker/task-records';
import { buildAuditStatement } from '../../../core/audit';
import { NotFoundError } from '../../../core/errors';
import { readTaskHistory } from '../task-history/task-history.service';
import { dueSoonWindow, withFlags } from '../tasks/task-flags';
import { requireOwner } from '../tasks/task-guards';
import {
  buildUpdateTaskStatement,
  findTask,
  listUnitTasks,
  type TaskRow,
} from '../tasks/tasks.repo';
import type { TaskChange } from '../tasks/tasks.schema';

/** Brief 21 B1, B2 and 18 B1: an event's tasks, flagged when due soon or overdue — informing, never blocking. */
export async function listEventTasks(
  db: D1Database,
  unitId: string,
  eventId: string,
): Promise<TaskRecord[]> {
  return withFlags(await listUnitTasks(db, unitId, { eventId }), await dueSoonWindow(db));
}

/** One of this event's tasks; any other is not found. */
async function requireEventTask(
  db: D1Database,
  params: { unitId: string; eventId: string; taskId: string },
): Promise<TaskRow> {
  const task = await findTask(db, params.taskId);
  if (task?.unitId !== params.unitId || task.eventId !== params.eventId)
    throw new NotFoundError('task-tracker.task-not-found');
  return task;
}

/**
 * Brief 21 B1, D-179 and 18's rules (D-138, D-139): a change to an event
 * task from the event screen — anything about it, its status too
 * ("remove" is Cancelled) — as statements for the Event organiser's batch.
 */
export async function buildEventTaskChangeStatements(
  db: D1Database,
  params: {
    unitId: string;
    eventId: string;
    taskId: string;
    version: number;
    task: TaskChange;
    actor: string;
  },
): Promise<D1PreparedStatement[]> {
  const before = await requireEventTask(db, params);
  await requireOwner(db, params.unitId, params.task.ownerPersonId, before.ownerPersonId);
  const at = new Date().toISOString();
  return [
    buildUpdateTaskStatement(db, {
      ...params.task,
      id: before.id,
      version: params.version,
      actor: params.actor,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: params.actor,
      action: 'task.changed',
      entityType: 'task',
      entityId: before.id,
      before: {
        title: before.title,
        description: before.description,
        ownerPersonId: before.ownerPersonId,
        dueDate: before.dueDate,
        status: before.status,
      },
      after: params.task,
    }),
  ];
}

/** Brief 21 B3: who added, changed or completed one of this event's tasks. */
export async function eventTaskHistory(
  db: D1Database,
  params: { unitId: string; eventId: string; taskId: string },
): Promise<TaskHistoryEntry[]> {
  const task = await requireEventTask(db, params);
  return readTaskHistory(db, task.id);
}
