import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ListKey } from '../../../../shared/administration-panel/lists';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchLists } from './lists.api';

type Request = ReturnType<typeof useApiRequest>;

/** One change to one list: an API call on that list. */
export interface ListChange {
  list: ListKey;
  run: (request: Request) => Promise<unknown>;
}

const KEY = ['lists'] as const;

/**
 * Brief 25 B3: every list's items and the archive categories, and every
 * change to a list (add, rename, retire, order). A refusal is shown
 * beside the list it concerns.
 */
export function useLists() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [refusal, setRefusal] = useState<{ list: ListKey; code: string } | null>(null);
  const lists = useQuery({ queryKey: KEY, queryFn: () => fetchLists(request) });
  const change = useMutation({
    mutationFn: (params: ListChange) => params.run(request),
    onSettled: (_data, error, params) => {
      const code = error instanceof ApiError ? error.code : 'server.error';
      setRefusal(error ? { list: params.list, code } : null);
      return queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
  return { lists, change, refusal };
}
