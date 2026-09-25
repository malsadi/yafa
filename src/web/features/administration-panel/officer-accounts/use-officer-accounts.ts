import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import type { OfficerAccountAction } from './account-actions-for';
import { fetchOfficerAccounts, resendInvitation, runAccountAction } from './officer-accounts.api';

const KEY = ['officer-accounts'] as const;

/** The outcome of the last action, for the screen to explain. */
export type ActionOutcome =
  | { kind: 'done'; action: OfficerAccountAction }
  | { kind: 'invitation-failed' }
  | { kind: 'refused'; code: string };

/** Brief 25 A2: every person's account state, and the actions on them. */
export function useOfficerAccounts() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<ActionOutcome | null>(null);
  const accounts = useQuery({ queryKey: KEY, queryFn: () => fetchOfficerAccounts(request) });

  const act = useMutation({
    mutationFn: async (params: { personId: string; action: OfficerAccountAction }) => {
      if (params.action === 'invitation') {
        const { invitation } = await resendInvitation(request, params.personId);
        return invitation === 'failed' ? 'invitation-failed' : 'done';
      }
      await runAccountAction(request, params.personId, params.action);
      return 'done';
    },
    onSuccess: (result, params) => {
      setOutcome(
        result === 'done' ? { kind: 'done', action: params.action } : { kind: 'invitation-failed' },
      );
    },
    onError: (error) => {
      setOutcome({
        kind: 'refused',
        code: error instanceof ApiError ? error.code : 'server.error',
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });

  return { accounts, act, outcome };
}
