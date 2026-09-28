import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { fetchMyTasks } from './task-tracker.api';
import { TASKS_KEY } from './task-keys';

/** Brief 18 B1: the officer's own tasks, in every unit of theirs, a page at a time. */
export function useMyTasks(page: number) {
  const request = useApiRequest();
  return useQuery({
    queryKey: [...TASKS_KEY, 'mine', String(page)],
    queryFn: () => fetchMyTasks(request, page),
  });
}
