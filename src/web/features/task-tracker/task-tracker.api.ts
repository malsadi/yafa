import type { Page } from '../../../shared/core/page';
import type {
  TaskHistoryEntry,
  TaskOwnerChoice,
  TaskRecord,
} from '../../../shared/task-tracker/task-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/task-tracker/units/${unitId}`;

/** Brief 18 B2: the action list's filters — owner, status or event; empty means any. */
export interface ActionListFilters {
  ownerPersonId: string;
  status: string;
  eventId: string;
}

export const fetchMyTasks = (request: Request, page: number) =>
  request<Page<TaskRecord>>(`/api/task-tracker/my-tasks?page=${String(page)}`);

export function fetchActionList(
  request: Request,
  unitId: string,
  filters: ActionListFilters,
  page: number,
) {
  const query = new URLSearchParams([
    ...Object.entries(filters).filter(([, v]) => v !== ''),
    ['page', String(page)],
  ]).toString();
  return request<Page<TaskRecord>>(`${unitPath(unitId)}/tasks?${query}`);
}

export const fetchTaskEvents = (request: Request, unitId: string) =>
  request<{ id: string; name: string }[]>(`${unitPath(unitId)}/task-events`);

export const fetchOwners = (request: Request, unitId: string) =>
  request<TaskOwnerChoice[]>(`${unitPath(unitId)}/owners`);

export const fetchHistory = (request: Request, unitId: string, taskId: string) =>
  request<TaskHistoryEntry[]>(`${unitPath(unitId)}/tasks/${taskId}/history`);
