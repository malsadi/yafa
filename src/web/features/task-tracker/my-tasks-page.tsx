import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { TaskItem } from './task-item';
import { useMyTasks } from './use-my-tasks';

/** Brief 18 B1 and D-137: the officer's own tasks, in one list, due soon and overdue highlighted. */
export function MyTasksPage() {
  const text = useText();
  const t = text.services['task-tracker'];
  const mine = useMyTasks();
  if (mine.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (mine.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const units = new Set(mine.data.map((task) => task.unitId));
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.mine.heading}</h2>
      {mine.data.length === 0 && <p>{t.mine.none}</p>}
      <ul className="flex flex-col gap-2">
        {mine.data.map((task) => (
          <TaskItem key={task.id} task={task} showUnit={units.size > 1} manages={false} />
        ))}
      </ul>
    </section>
  );
}
