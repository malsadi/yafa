import { useQuery } from '@tanstack/react-query';
import type { TaskHistoryEntry } from '../../../shared/task-tracker/task-records';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchHistory } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** Brief 18 B4 and 21 B3: a task's history, once asked for — from the tracker, or from its event. */
export function useTaskHistory(unitId: string, taskId: string, enabled: boolean, path?: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'history', taskId, path],
    queryFn: () =>
      path ? request<TaskHistoryEntry[]>(path) : fetchHistory(request, unitId, taskId),
    enabled,
  });
}
