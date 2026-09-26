import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchActionList, type ActionListFilters } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** Brief 18 B2: the unit's action list, filtered. */
export function useActionList(unitId: string, filters: ActionListFilters) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'list', filters],
    queryFn: () => fetchActionList(request, unitId, filters),
  });
}
