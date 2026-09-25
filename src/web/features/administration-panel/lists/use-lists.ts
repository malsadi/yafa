import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ListKey } from '../../../../shared/administration-panel/lists';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import type { BilingualNames } from '../../../components/bilingual-name-form';
import { addListItem, fetchLists, renameListItem } from './lists.api';

const KEY = ['lists'] as const;

/** Brief 25 B3: every list's items and the archive categories; adding and renaming items. */
export function useLists() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<{ list: ListKey; code: string } | null>(null);
  const lists = useQuery({ queryKey: KEY, queryFn: () => fetchLists(request) });

  const settle = (list: ListKey, error: Error | null) => {
    const code = error instanceof ApiError ? error.code : 'server.error';
    setRefusal(error ? { list, code } : null);
    return queryClient.invalidateQueries({ queryKey: KEY });
  };
  const add = useMutation({
    mutationFn: (params: { list: ListKey; names: BilingualNames }) =>
      addListItem(request, params.list, params.names),
    onSettled: (_data, error, params) => settle(params.list, error),
  });
  const rename = useMutation({
    mutationFn: (params: { list: ListKey; itemId: string; names: BilingualNames }) =>
      renameListItem(request, params),
    onSettled: (_data, error, params) => settle(params.list, error),
  });

  return { lists, add, rename, refusal };
}
