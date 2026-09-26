import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchOwners } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** D-139: the unit's current officers, whom a task may be given to — for those who manage tasks. */
export function useTaskOwners(unitId: string, enabled: boolean) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'owners'],
    queryFn: () => fetchOwners(request, unitId),
    enabled,
  });
}
