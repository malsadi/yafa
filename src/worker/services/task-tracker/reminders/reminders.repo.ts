import { generateId } from '../../../core/ids';

export type ReminderKind = 'due-soon' | 'overdue';

export interface ReminderDue {
  taskId: string;
  unitId: string;
  ownerPersonId: string;
  title: string;
  dueDate: string;
}

/**
 * D-142: open tasks owed a reminder of this kind for their current due date
 * — due within the days ahead (inclusive) for "due soon", past it for
 * "overdue" — and not yet sent one.
 */
export async function listRemindersDue(
  db: D1Database,
  params: { kind: ReminderKind; today: string; until: string },
): Promise<ReminderDue[]> {
  const window = params.kind === 'due-soon' ? 't.due_date BETWEEN ?2 AND ?3' : 't.due_date < ?2';
  const { results } = await db
    .prepare(
      `SELECT t.id AS taskId, t.unit_id AS unitId, t.owner_person_id AS ownerPersonId, t.title, t.due_date AS dueDate
       FROM tasks t
       WHERE t.status IN ('To do', 'In progress') AND ${window}
         AND NOT EXISTS (SELECT 1 FROM task_reminders_sent r
           WHERE r.task_id = t.id AND r.kind = ?1 AND r.due_date = t.due_date)
       ORDER BY t.due_date`,
    )
    .bind(
      ...(params.kind === 'due-soon'
        ? [params.kind, params.today, params.until]
        : [params.kind, params.today]),
    )
    .all<ReminderDue>();
  return results;
}

/** D-142: the reminder recorded as sent — once per task, kind and due date (a unique index). */
export function buildReminderSentStatement(
  db: D1Database,
  row: ReminderDue & { kind: ReminderKind; at: string },
): D1PreparedStatement {
  return db
    .prepare(
      'INSERT INTO task_reminders_sent (id, task_id, unit_id, kind, due_date, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(generateId(), row.taskId, row.unitId, row.kind, row.dueDate, row.at);
}
