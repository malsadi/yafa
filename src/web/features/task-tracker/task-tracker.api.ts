import type {
  TaskHistoryEntry,
  TaskOwnerChoice,
  TaskRecord,
} from '../../../shared/task-tracker/task-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/task-tracker/units/${unitId}`;

/** Brief 18 B2: the action list's filters; empty means any. */
export interface ActionListFilters {
  ownerPersonId: string;
  status: string;
}

export const fetchMyTasks = (request: Request) =>
  request<TaskRecord[]>('/api/task-tracker/my-tasks');

export function fetchActionList(request: Request, unitId: string, filters: ActionListFilters) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== '')).toString();
  return request<TaskRecord[]>(`${unitPath(unitId)}/tasks${query ? `?${query}` : ''}`);
}

export const fetchOwners = (request: Request, unitId: string) =>
  request<TaskOwnerChoice[]>(`${unitPath(unitId)}/owners`);

export const fetchHistory = (request: Request, unitId: string, taskId: string) =>
  request<TaskHistoryEntry[]>(`${unitPath(unitId)}/tasks/${taskId}/history`);
