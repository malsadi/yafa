import type { TaskHistoryEntry } from '../../../../shared/task-tracker/task-records';
import { ForbiddenError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import { listPeopleNames } from '../../committee-register';
import { requireTaskUnit } from '../task-tracker-access';
import { requireUnitTask } from '../tasks/task-guards';
import { READ } from '../tasks/tasks.service';

interface AuditRow {
  action: string;
  actorName: string | null;
  occurredAt: string;
  before: string | null;
  after: string | null;
}

const FIELDS = ['title', 'description', 'ownerPersonId', 'dueDate', 'status'] as const;
/** A recorded field as text: the task's fields are all strings (a status, a date, a name's id). */
const text = (value: unknown) => (typeof value === 'string' ? value : null);

/** What a step changed, field by field; for a creation, every field as it was set. */
function changesOf(row: AuditRow): TaskHistoryEntry['changes'] {
  const before = row.before ? (JSON.parse(row.before) as Record<string, unknown>) : {};
  const after = row.after ? (JSON.parse(row.after) as Record<string, unknown>) : {};
  return FIELDS.filter((f) => f in after && text(after[f]) !== text(before[f])).map((field) => ({
    field,
    before: text(before[field]),
    after: text(after[field]),
  }));
}

/**
 * Brief 18 B4: who created, changed or completed a task, and when — from
 * the audit log, which feeds task histories (9.2). For its owner (D-137),
 * and for those who read the unit's action list.
 */
export async function taskHistory(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; taskId: string },
): Promise<TaskHistoryEntry[]> {
  const unit = await requireTaskUnit(db, params.unitId);
  const task = await requireUnitTask(db, unit.id, params.taskId);
  if (task.ownerPersonId !== ctx.personId && !(await can(db, ctx, READ, { unitId: unit.id }))) {
    throw new ForbiddenError('permission.denied');
  }
  const { results } = await db
    .prepare(
      `SELECT a.action, p.name AS actorName, a.occurred_at AS occurredAt, a.before, a.after
       FROM audit_log a LEFT JOIN people p ON p.id = a.actor_person_id
       WHERE a.entity_type = 'task' AND a.entity_id = ? ORDER BY a.occurred_at, a.rowid`,
    )
    .bind(task.id)
    .all<AuditRow>();
  const entries = results.map((row) => ({
    action: row.action === 'task.created' ? ('created' as const) : ('changed' as const),
    actorName: row.actorName,
    occurredAt: row.occurredAt,
    changes: changesOf(row),
  }));
  return withOwnerNames(db, entries);
}

/** An owner is recorded by id; the history shows their name. */
async function withOwnerNames(
  db: D1Database,
  entries: TaskHistoryEntry[],
): Promise<TaskHistoryEntry[]> {
  const names = new Map((await listPeopleNames(db)).map((p) => [p.personId, p.name]));
  const name = (id: string | null) => (id === null ? null : (names.get(id) ?? id));
  return entries.map((entry) => ({
    ...entry,
    changes: entry.changes.map((c) =>
      c.field === 'ownerPersonId' ? { ...c, before: name(c.before), after: name(c.after) } : c,
    ),
  }));
}
