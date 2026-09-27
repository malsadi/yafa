import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { draftOf } from '../task-tracker/task-draft';
import { TaskHeading } from '../task-tracker/task-heading';
import { TaskHistoryPanel } from '../task-tracker/task-history-panel';
import { ActionButton } from '../../components/action-button';
import { eventPath } from './event-organiser.api';
import { EventTaskForm } from './event-task-form';
import { eventTaskRequest } from './event-task-request';
import { useEventAction } from './use-event-action';

/** Brief 21 B1 to B3: one event task — changed or removed (Cancelled, D-179) until close, with its history. */
export function EventTaskItem(props: { event: EventSummary; task: TaskRecord; manages: boolean }) {
  const t = useText().services['task-tracker'];
  const e = useText().services['event-organiser'];
  const remove = useEventAction();
  const [editing, setEditing] = useState(false);
  const { task, event } = props;
  const stopEditing = () => {
    setEditing(false);
  };
  if (editing)
    return (
      <li>
        <EventTaskForm event={event} task={task} onDone={stopEditing} />
      </li>
    );
  const removeTask = () => {
    remove.mutate(eventTaskRequest(event, { ...draftOf(task), status: 'Cancelled' }, task));
  };
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <TaskHeading task={task} />
      {task.description && <p className="whitespace-pre-line text-sm">{task.description}</p>}
      <p className="text-sm text-slate-600">
        {fillText(t.ownedBy, { name: task.ownerName ?? '' })} · {t.statuses[task.status]}
      </p>
      <ErrorAlert error={remove.error} refusals={{ ...t.refusals, ...e.refusals }} />
      {props.manages && (
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label={t.edit}
            onClick={() => {
              setEditing(true);
            }}
          />
          {task.status !== 'Cancelled' && (
            <ActionButton label={e.tasks.remove} disabled={remove.isPending} onClick={removeTask} />
          )}
        </div>
      )}
      <TaskHistoryPanel
        unitId={task.unitId}
        taskId={task.id}
        path={`${eventPath(event.unitId, event.id)}/tasks/${task.id}/history`}
      />
    </li>
  );
}
