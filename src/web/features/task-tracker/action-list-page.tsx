import { useState } from 'react';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { StatusMessage } from '../../components/status-message';
import { ActionListFiltersForm } from './action-list-filters';
import { AddTaskControl } from './add-task-control';
import { TaskItem } from './task-item';
import { useActionList } from './use-action-list';
import { useTaskOwners } from './use-task-owners';
import { useTaskUnit } from './use-task-unit';

const ANY = { ownerPersonId: '', status: '', eventId: '' };

/** The events the unit's tasks belong to, once each, to filter by (18 B2). */
function eventsOf(tasks: TaskRecord[]): { id: string; name: string }[] {
  const byId = new Map<string, string>();
  for (const task of tasks) if (task.eventId) byId.set(task.eventId, task.eventName ?? '');
  return [...byId].map(([id, name]) => ({ id, name }));
}

/** Brief 18 A1 and B2: the unit's action list — all its tasks, filtered — and adding tasks. */
export function ActionListPage() {
  const unitId = useTaskUnit();
  const text = useText();
  const t = text.services['task-tracker'];
  const { context } = useActiveSession();
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('task-tracker.tasks.manage');
  const [filters, setFilters] = useState(ANY);
  const list = useActionList(unitId, filters);
  const events = eventsOf(useActionList(unitId, ANY).data ?? []);
  const owners = useTaskOwners(unitId, manages);
  if (list.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (list.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.actionList.heading}</h2>
      <ActionListFiltersForm
        initial={filters}
        owners={owners.data ?? []}
        events={events}
        onApply={setFilters}
      />
      {list.data.length === 0 && <p>{t.actionList.none}</p>}
      <ul className="flex flex-col gap-2">
        {list.data.map((task) => (
          <TaskItem key={task.id} task={task} showUnit={false} manages={manages} />
        ))}
      </ul>
      {manages && <AddTaskControl unitId={unitId} />}
    </section>
  );
}
