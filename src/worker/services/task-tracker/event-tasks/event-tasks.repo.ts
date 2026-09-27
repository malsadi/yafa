import { buildAuditStatement } from '../../../core/audit';
import { generateId } from '../../../core/ids';
import { buildInsertTaskStatement } from '../tasks/tasks.repo';
import type { TaskDetails } from '../tasks/tasks.schema';

/**
 * Brief 10.1 ("Event task added or changed") and 18 A1: an event's tasks
 * are the same records as the tracker's, marked with their event — written
 * here, as statements for the Event organiser's own batch, each with the
 * history entry the tracker shows (18 B4, 21 B3).
 */
export function buildEventTaskStatements(
  db: D1Database,
  params: { unitId: string; eventId: string; tasks: TaskDetails[]; actor: string; at: string },
): { taskIds: string[]; statements: D1PreparedStatement[] } {
  const rows = params.tasks.map((task) => ({ ...task, id: generateId() }));
  return {
    taskIds: rows.map((row) => row.id),
    statements: rows.flatMap((row) => [
      buildInsertTaskStatement(db, {
        ...row,
        unitId: params.unitId,
        eventId: params.eventId,
        actor: params.actor,
        at: params.at,
      }),
      buildAuditStatement(db, {
        actorPersonId: params.actor,
        action: 'task.created',
        entityType: 'task',
        entityId: row.id,
        after: {
          title: row.title,
          description: row.description,
          ownerPersonId: row.ownerPersonId,
          dueDate: row.dueDate,
          status: 'To do',
        },
      }),
    ]),
  };
}
