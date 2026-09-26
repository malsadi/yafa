import type { TaskStatus } from '../../../../shared/task-tracker/task-statuses';
import { buildAuditStatement } from '../../../core/audit';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { requireTaskUnit, requireWritable } from '../task-tracker-access';
import { requireUnitTask, runTaskBatch } from './task-guards';
import { buildUpdateTaskStatement } from './tasks.repo';
import { MANAGE } from './tasks.service';

/**
 * Brief 18 A4, D-137 and D-138: change a task's status — by its owner, who
 * needs no capability, or by someone who manages the unit's tasks. Any
 * status to any other: tasks are fully flexible (18's rules).
 */
export async function changeTaskStatus(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; taskId: string; version: number; status: TaskStatus },
): Promise<void> {
  const unit = await requireTaskUnit(db, params.unitId);
  requireWritable(unit);
  const task = await requireUnitTask(db, unit.id, params.taskId);
  const owns = task.ownerPersonId === ctx.personId;
  if (!owns && !(await can(db, ctx, MANAGE, { unitId: unit.id })))
    throw new ForbiddenError('permission.denied');
  const details = {
    title: task.title,
    description: task.description,
    ownerPersonId: task.ownerPersonId,
    dueDate: task.dueDate,
  };
  await runTaskBatch(db, [
    buildUpdateTaskStatement(db, {
      ...details,
      status: params.status,
      id: task.id,
      version: params.version,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'task.changed',
      entityType: 'task',
      entityId: task.id,
      before: { status: task.status },
      after: { status: params.status },
    }),
  ]);
}
