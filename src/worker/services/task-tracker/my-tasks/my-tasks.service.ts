import type { TaskRecord } from '../../../../shared/task-tracker/task-records';
import type { RequestContext } from '../../../core/permissions';
import { isServiceEnabled } from '../../../core/service-switches';
import { dueSoonWindow, withFlags } from '../tasks/task-flags';
import { listOwnedTasks } from '../tasks/tasks.repo';

/**
 * Brief 18 B1 and D-137: an officer's own tasks, in every unit of theirs
 * where the Task tracker is on, with due soon and overdue highlighted. No
 * capability: every officer sees their own.
 */
export async function listMyTasks(db: D1Database, ctx: RequestContext): Promise<TaskRecord[]> {
  const on = await Promise.all(
    ctx.units.map(async (unitId) =>
      (await isServiceEnabled(db, 'task-tracker', unitId)) ? unitId : null,
    ),
  );
  const unitIds = on.filter((id): id is string => id !== null);
  if (unitIds.length === 0) return [];
  return withFlags(await listOwnedTasks(db, ctx.personId, unitIds), await dueSoonWindow(db));
}
