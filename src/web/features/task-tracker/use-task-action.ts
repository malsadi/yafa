import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { TASKS_KEY } from './task-keys';

/** A change to a task (create, change, status); every task view refreshes after. */
export function useTaskAction() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body: object }) =>
      request<unknown>(p.path, { method: p.method, body: p.body }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
