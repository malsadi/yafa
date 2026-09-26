import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchHistory } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** Brief 18 B4: a task's history, once asked for. */
export function useTaskHistory(unitId: string, taskId: string, enabled: boolean) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'history', taskId],
    queryFn: () => fetchHistory(request, unitId, taskId),
    enabled,
  });
}
