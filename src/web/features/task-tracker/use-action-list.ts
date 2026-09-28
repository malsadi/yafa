import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchActionList, fetchTaskEvents, type ActionListFilters } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** Brief 18 B2: the unit's action list, filtered. */
export function useActionList(unitId: string, filters: ActionListFilters, page: number) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'list', filters, page],
    queryFn: () => fetchActionList(request, unitId, filters, page),
  });
}

/** Brief 18 B2: the events the unit's tasks belong to, to filter by. */
export function useTaskEvents(unitId: string) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, unitId, 'events'],
    queryFn: () => fetchTaskEvents(request, unitId),
  });
}
