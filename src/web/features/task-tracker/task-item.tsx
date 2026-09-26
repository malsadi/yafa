import { useState } from 'react';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { fillText } from '../../text/fill-text';
import { TaskForm } from './task-form';
import { TaskHeading } from './task-heading';
import { TaskHistoryPanel } from './task-history-panel';
import { TaskStatusSelect } from './task-status-select';

/** Brief 18 A and B: one task — its due date and flags, owner, status, changing it, and its history. */
export function TaskItem(props: { task: TaskRecord; showUnit: boolean; manages: boolean }) {
  const t = useText().services['task-tracker'];
  const { language } = useLanguage();
  const { context } = useActiveSession();
  const [editing, setEditing] = useState(false);
  const { task } = props;
  if (editing)
    return (
      <li>
        <TaskForm
          unitId={task.unitId}
          task={task}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  const mayChangeStatus = props.manages || task.ownerPersonId === context.personId;
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <TaskHeading task={task} />
      {task.description && <p className="whitespace-pre-line text-sm">{task.description}</p>}
      <p className="text-sm text-slate-600">
        {fillText(t.ownedBy, { name: task.ownerName ?? '' })}
        {props.showUnit && ` · ${language === 'ar' ? task.unitNameAr : task.unitNameEn}`}
      </p>
      <div className="flex flex-wrap items-start gap-3">
        {mayChangeStatus ? (
          <TaskStatusSelect task={task} />
        ) : (
          <span className="text-sm">{t.statuses[task.status]}</span>
        )}
        {props.manages && (
          <button
            type="button"
            className="rounded border border-slate-400 px-3 py-1"
            onClick={() => {
              setEditing(true);
            }}
          >
            {t.edit}
          </button>
        )}
      </div>
      <TaskHistoryPanel unitId={task.unitId} taskId={task.id} />
    </li>
  );
}
