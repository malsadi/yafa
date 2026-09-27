import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { ActionButton } from './action-button';
import { useEventHints } from './event-hints';
import { EventProgress } from './event-progress';
import { EventTaskForm } from './event-task-form';
import { EventTaskItem } from './event-task-item';
import { useEventTasks } from './use-event-queries';

/**
 * Brief 21 B1, B2: the event's tasks and its progress. Tasks are added,
 * changed and removed at any time until the event is closed.
 */
export function EventTasksPanel({ event }: { event: EventSummary }) {
  const e = useText().services['event-organiser'];
  const hints = useEventHints(event);
  const tasks = useEventTasks(event.unitId, event.id);
  const [adding, setAdding] = useState(false);
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{e.tasks.heading}</h3>
      <ErrorAlert error={tasks.error} refusals={e.refusals} />
      {tasks.data && <EventProgress progress={tasks.data.progress} />}
      <ul className="flex flex-col gap-2">
        {tasks.data?.tasks.map((task) => (
          <EventTaskItem key={task.id} event={event} task={task} manages={hints.manages} />
        ))}
      </ul>
      {hints.manages && !adding && (
        <ActionButton
          primary
          label={e.tasks.add}
          onClick={() => {
            setAdding(true);
          }}
        />
      )}
      {adding && (
        <EventTaskForm
          event={event}
          onDone={() => {
            setAdding(false);
          }}
        />
      )}
    </section>
  );
}
