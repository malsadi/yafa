import { useState } from 'react';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { TaskControls } from './task-controls';
import { TaskForm } from './task-form';
import { TaskHeading } from './task-heading';
import { TaskHistoryPanel } from './task-history-panel';

/** Brief 18 A and B: one task — its due date and flags, owner, status, changing it, and its history. */
export function TaskItem(props: { task: TaskRecord; showUnit: boolean; manages: boolean }) {
  const t = useText().services['task-tracker'];
  const { language } = useLanguage();
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
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <TaskHeading task={task} />
      {task.description && <p className="whitespace-pre-line text-sm">{task.description}</p>}
      <p className="text-sm text-slate-600">
        {fillText(t.ownedBy, { name: task.ownerName ?? '' })}
        {props.showUnit && ` · ${language === 'ar' ? task.unitNameAr : task.unitNameEn}`}
      </p>
      <TaskControls
        task={task}
        manages={props.manages}
        onEdit={() => {
          setEditing(true);
        }}
      />
      <TaskHistoryPanel unitId={task.unitId} taskId={task.id} />
    </li>
  );
}
