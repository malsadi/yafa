import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { LETTERS_KEY } from './correspondence.api';

/** A change to a letter in; every letters view refreshes after. */
export function useLetterAction() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; body: object }) =>
      request(p.path, { method: 'PUT', body: p.body }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: LETTERS_KEY }),
  });
}
