import type { TaskOwnerChoice, TaskRecord } from '../../../shared/task-tracker/task-records';
import type { TaskDraft } from './task-form-fields';
import { unitPath } from './task-tracker.api';

/** A task's form: blank for a new one (To do), or the task as it stands. */
export function draftOf(task?: TaskRecord): TaskDraft {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    ownerPersonId: task?.ownerPersonId ?? '',
    dueDate: task?.dueDate ?? '',
    status: task?.status ?? 'To do',
  };
}

/** The owners offered: the unit's current officers, and the task's own owner if they no longer are one. */
export function ownerChoices(officers: TaskOwnerChoice[], task?: TaskRecord): TaskOwnerChoice[] {
  if (!task || officers.some((o) => o.personId === task.ownerPersonId)) return officers;
  return [...officers, { personId: task.ownerPersonId, name: task.ownerName ?? '' }];
}

/** D-138 and 9.1: the request the form makes — a new task, or a change from the version read. */
export function saveRequest(unitId: string, draft: TaskDraft, task?: TaskRecord) {
  const details = {
    title: draft.title,
    description: draft.description,
    ownerPersonId: draft.ownerPersonId,
    dueDate: draft.dueDate,
  };
  const base = `${unitPath(unitId)}/tasks`;
  return task
    ? {
        path: `${base}/${task.id}`,
        method: 'PUT' as const,
        body: { version: task.version, task: { ...details, status: draft.status } },
      }
    : { path: base, method: 'POST' as const, body: details };
}
