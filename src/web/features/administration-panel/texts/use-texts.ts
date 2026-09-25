import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TextsView } from '../../../../shared/administration-panel/texts';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { ME_QUERY_KEY } from '../../../app/session/use-me';

const PATH = '/api/administration-panel/texts';
const KEY = ['admin-texts'] as const;

type Change =
  | { kind: 'privacy-notice'; text: { textEn: string; textAr: string | null } }
  | { kind: 'access-not-active' | 'help'; text: { textEn: string; textAr: string | null } };

/** Brief 25 C5: the texts, and writing one. A new notice version asks this officer to read it too. */
export function useTexts() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const view = useQuery({ queryKey: KEY, queryFn: () => request<TextsView>(PATH) });
  const save = useMutation({
    mutationFn: (change: Change) =>
      change.kind === 'privacy-notice'
        ? request<unknown>(`${PATH}/privacy-notice`, { method: 'POST', body: change.text })
        : request<unknown>(`${PATH}/${change.kind}`, { method: 'PUT', body: change.text }),
    onSettled: async (_data, _error, change) => {
      // D-016 and D-027: a new notice is shown to this officer too, straight away.
      if (change.kind === 'privacy-notice')
        await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      return queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
  const refusal =
    save.error instanceof ApiError ? save.error.code : save.error ? 'server.error' : null;
  return { view, save, refusal };
}
