import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';

/** D-074: set one required setting, then reload the checklist. */
export function useSetRequiredSetting() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (params: { key: string; value: unknown }) =>
      request<undefined>(`/api/administration-panel/setup-checklist/settings/${params.key}`, {
        method: 'PUT',
        body: { value: params.value },
      }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['setup-checklist'] }),
  });
  const refusal =
    save.error instanceof ApiError ? save.error.code : save.error ? 'server.error' : null;
  return { save, refusal };
}
