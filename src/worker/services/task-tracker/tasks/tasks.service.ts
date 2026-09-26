import type { TaskOwnerChoice, TaskRecord } from '../../../../shared/task-tracker/task-records';
import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listCurrentOfficersOf } from '../../committee-register';
import { requireTaskCapability, requireWritable } from '../task-tracker-access';
import { dueSoonWindow, withFlags } from './task-flags';
import { requireOwner, requireUnitTask, runTaskBatch } from './task-guards';
import { buildInsertTaskStatement, buildUpdateTaskStatement, listUnitTasks } from './tasks.repo';
import type { ActionListFilters, TaskChange, TaskDetails } from './tasks.schema';

export const READ = 'task-tracker.tasks.read';
export const MANAGE = 'task-tracker.tasks.manage';

/** Brief 18 B2: the unit's action list — all its tasks, filtered by owner, status or event. */
export async function listActionList(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  filters: ActionListFilters,
): Promise<TaskRecord[]> {
  await requireTaskCapability(db, ctx, READ, unitId);
  return withFlags(await listUnitTasks(db, unitId, filters), await dueSoonWindow(db));
}

/** Brief 18 A2 and D-139: the unit's current officers, whom a task may be given to. */
export async function listOwnerChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<TaskOwnerChoice[]> {
  await requireTaskCapability(db, ctx, MANAGE, unitId);
  return listCurrentOfficersOf(db, unitId, getTodayInLondon());
}

/** Brief 18 A1 to A3 and D-139: a branch task, To do, with its owner and due date. */
export async function createTask(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  details: TaskDetails,
): Promise<{ taskId: string }> {
  requireWritable(await requireTaskCapability(db, ctx, MANAGE, unitId));
  await requireOwner(db, unitId, details.ownerPersonId);
  const row = {
    ...details,
    id: generateId(),
    unitId,
    actor: ctx.personId,
    at: new Date().toISOString(),
  };
  await runTaskBatch(db, [
    buildInsertTaskStatement(db, row),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'task.created',
      entityType: 'task',
      entityId: row.id,
      after: { ...details, status: 'To do' },
    }),
  ]);
  return { taskId: row.id };
}

/** Brief 18 A2 to A4 and D-138: change anything about a task, at any time (the rules), from the version read. */
export async function changeTask(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; taskId: string; version: number; task: TaskChange },
): Promise<void> {
  requireWritable(await requireTaskCapability(db, ctx, MANAGE, params.unitId));
  const before = await requireUnitTask(db, params.unitId, params.taskId);
  await requireOwner(db, params.unitId, params.task.ownerPersonId, before.ownerPersonId);
  await runTaskBatch(db, [
    buildUpdateTaskStatement(db, {
      ...params.task,
      id: before.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
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
  ]);
}
