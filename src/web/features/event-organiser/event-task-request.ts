import type { EventSummary } from '../../../shared/event-organiser/event-records';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import type { TaskDraft } from '../task-tracker/task-form-fields';
import { eventPath } from './event-organiser.api';

/** Brief 21 B1 and D-179: an event task added, or edited, reassigned or rescheduled, from the version read. */
export function eventTaskRequest(event: EventSummary, draft: TaskDraft, task?: TaskRecord) {
  const details = {
    title: draft.title,
    description: draft.description,
    ownerPersonId: draft.ownerPersonId,
    dueDate: draft.dueDate,
  };
  const base = `${eventPath(event.unitId, event.id)}/tasks`;
  return task
    ? {
        path: `${base}/${task.id}`,
        method: 'PUT' as const,
        body: { version: task.version, task: { ...details, status: draft.status } },
      }
    : { path: base, method: 'POST' as const, body: details };
}
