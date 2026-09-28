import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { PagedList } from '../../components/paged-list';
import { ActionListFiltersForm } from './action-list-filters';
import { AddTaskControl } from './add-task-control';
import { TaskItem } from './task-item';
import { useActionList, useTaskEvents } from './use-action-list';
import { useTaskOwners } from './use-task-owners';
import { useTaskUnit } from './use-task-unit';

const ANY = { ownerPersonId: '', status: '', eventId: '' };

/** Brief 18 A1 and B2: the unit's action list — all its tasks, filtered, a page at a time — and adding tasks. */
export function ActionListPage() {
  const unitId = useTaskUnit();
  const t = useText().services['task-tracker'];
  const { context } = useActiveSession();
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('task-tracker.tasks.manage');
  const [filters, setFilters] = useState(ANY);
  const [page, setPage] = useState(1);
  const list = useActionList(unitId, filters, page);
  const events = useTaskEvents(unitId);
  const owners = useTaskOwners(unitId, manages);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.actionList.heading}</h2>
      <ActionListFiltersForm
        initial={filters}
        owners={owners.data ?? []}
        events={events.data ?? []}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />
      <PagedList query={list} none={t.actionList.none} refusals={t.refusals} onPage={setPage}>
        {(tasks) => (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} showUnit={false} manages={manages} />
            ))}
          </ul>
        )}
      </PagedList>
      {manages && <AddTaskControl unitId={unitId} />}
    </section>
  );
}
