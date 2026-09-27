import type { TaskHistoryEntry, TaskRecord } from '../../../../shared/task-tracker/task-records';
import { ServiceUnavailableError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import {
  buildEventTaskChangeStatements,
  buildEventTaskStatements,
  eventTaskHistory,
  listEventTasks,
  requireTaskOwner,
  type TaskChange,
  type TaskDetails,
} from '../../task-tracker';
import { requireEventCapability, requireWritable, runEventBatch } from '../event-access';
import { requireNotClosed, requireUnitEvent } from '../events/event-guards';
import { MANAGE, READ } from '../events/events.service';
import { eventProgress, type EventProgress } from './progress';

interface EventRef {
  unitId: string;
  eventId: string;
}

/** Brief 21 B1, B2: the event's tasks and its progress, recalculated on every read. */
export async function eventTasks(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef,
): Promise<{ tasks: TaskRecord[]; progress: EventProgress }> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  await requireUnitEvent(db, params.unitId, params.eventId);
  const counts = await getSetting<boolean>(db, 'event-organiser.cancelled_tasks_count_in_progress');
  if (counts.status !== 'configured') throw new ServiceUnavailableError('setting.not-configured');
  const tasks = await listEventTasks(db, params.unitId, params.eventId);
  return { tasks, progress: eventProgress(tasks, counts.value) };
}

/** Manage events, in a unit that can be written to, on an event that isn't closed (D-174, D-184). */
async function requireManageable(db: D1Database, ctx: RequestContext, params: EventRef) {
  requireWritable(await requireEventCapability(db, ctx, MANAGE, params.unitId));
  requireNotClosed(await requireUnitEvent(db, params.unitId, params.eventId));
}

/** Brief 21 B1 and 10.1: a task added to the event — the same record the Task tracker shows. */
export async function addEventTask(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { task: TaskDetails },
): Promise<{ taskId: string }> {
  await requireManageable(db, ctx, params);
  await requireTaskOwner(db, params.unitId, params.task.ownerPersonId);
  const written = buildEventTaskStatements(db, {
    unitId: params.unitId,
    eventId: params.eventId,
    tasks: [params.task],
    actor: ctx.personId,
    at: new Date().toISOString(),
  });
  await runEventBatch(db, written.statements);
  return { taskId: written.taskIds[0] ?? '' };
}

/** Brief 21 B1 and D-179: edit, reassign, reschedule, or remove (Cancelled) — until the event is closed. */
export async function changeEventTask(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { taskId: string; version: number; task: TaskChange },
): Promise<void> {
  await requireManageable(db, ctx, params);
  const statements = await buildEventTaskChangeStatements(db, { ...params, actor: ctx.personId });
  await runEventBatch(db, statements);
}

/** Brief 21 B3: a task's history, for those who see the event. */
export async function eventTaskSteps(
  db: D1Database,
  ctx: RequestContext,
  params: EventRef & { taskId: string },
): Promise<TaskHistoryEntry[]> {
  await requireEventCapability(db, ctx, READ, params.unitId);
  await requireUnitEvent(db, params.unitId, params.eventId);
  return eventTaskHistory(db, params);
}
