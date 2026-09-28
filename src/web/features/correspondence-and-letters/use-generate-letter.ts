import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useApiRequest } from '../../app/api/use-api-request';
import { LETTERS_KEY, unitPath } from './correspondence.api';
import type { generateBody } from './letter-draft';

/** Brief 23 A2: generate the letter, then open it — numbered, filed and locked. */
export function useGenerateLetter(unitId: string) {
  const request = useApiRequest();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReturnType<typeof generateBody>) =>
      request<{ id: string }>(`${unitPath(unitId)}/letters-out`, { method: 'POST', body }),
    onSuccess: async ({ id }) => {
      await queryClient.invalidateQueries({ queryKey: LETTERS_KEY });
      await navigate(`/correspondence-and-letters/letters-out/${id}`);
    },
  });
}
