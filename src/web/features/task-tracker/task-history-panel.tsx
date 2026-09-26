import { useState } from 'react';
import type { TaskHistoryEntry } from '../../../shared/task-tracker/task-records';
import { TASK_STATUSES, type TaskStatus } from '../../../shared/task-tracker/task-statuses';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useTaskHistory } from './use-task-history';

/** Brief 18 B4: who created, changed or completed a task, and when — opened on request. */
export function TaskHistoryPanel({ unitId, taskId }: { unitId: string; taskId: string }) {
  const t = useText().services['task-tracker'];
  const when = useFormatTimestamp();
  const [open, setOpen] = useState(false);
  const history = useTaskHistory(unitId, taskId, open);
  const value = (field: string, v: string | null) =>
    v === null
      ? t.history.empty
      : field === 'status' && (TASK_STATUSES as readonly string[]).includes(v)
        ? t.statuses[v as TaskStatus]
        : v;
  const line = (entry: TaskHistoryEntry) =>
    fillText(entry.action === 'created' ? t.history.created : t.history.changed, {
      name: entry.actorName ?? '',
      date: when(entry.occurredAt),
    });
  return (
    <details
      className="text-sm"
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
      }}
    >
      <summary>{t.history.show}</summary>
      <ol className="flex flex-col gap-1 ps-4">
        {history.data?.map((entry) => (
          <li key={`${entry.occurredAt}-${entry.action}`}>
            <p>{line(entry)}</p>
            {entry.action === 'changed' &&
              entry.changes.map((c) => (
                <p key={c.field} className="text-slate-600">
                  {fillText(t.history.change, {
                    field: t.history.fields[c.field as keyof typeof t.history.fields],
                    before: value(c.field, c.before),
                    after: value(c.field, c.after),
                  })}
                </p>
              ))}
          </li>
        ))}
      </ol>
    </details>
  );
}
