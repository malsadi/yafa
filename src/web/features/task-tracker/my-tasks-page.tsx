import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { PagedList } from '../../components/paged-list';
import { TaskItem } from './task-item';
import { useMyTasks } from './use-my-tasks';

/** Brief 18 B1 and D-137: the officer's own tasks, in one list, due soon and overdue highlighted. */
export function MyTasksPage() {
  const t = useText().services['task-tracker'];
  const [page, setPage] = useState(1);
  const mine = useMyTasks(page);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.mine.heading}</h2>
      <PagedList query={mine} none={t.mine.none} refusals={t.refusals} onPage={setPage}>
        {(tasks) => {
          const units = new Set(tasks.map((task) => task.unitId));
          return (
            <ul className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} showUnit={units.size > 1} manages={false} />
              ))}
            </ul>
          );
        }}
      </PagedList>
    </section>
  );
}
