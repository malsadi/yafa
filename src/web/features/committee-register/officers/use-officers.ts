import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import {
  addOfficer,
  endTerm,
  fetchOfficers,
  updatePerson,
  type InvitationOutcome,
  type NewOfficer,
} from './officers.api';

/** What the last change did, for the screen to explain. */
export type OfficersOutcome =
  | { kind: 'added'; invitation: InvitationOutcome }
  | { kind: 'updated' }
  | { kind: 'ended'; accountLocked: boolean }
  | { kind: 'refused'; code: string };

/** Brief 14 B1 and B3: a unit's officers, adding one, correcting a person, ending a term. */
export function useOfficers(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<OfficersOutcome | null>(null);
  const officers = useQuery({
    queryKey: ['committee-register', unitId, 'officers'],
    queryFn: () => fetchOfficers(request, unitId),
  });
  const onError = (error: Error) => {
    setOutcome({ kind: 'refused', code: error instanceof ApiError ? error.code : 'server.error' });
  };
  const onSettled = () =>
    queryClient.invalidateQueries({ queryKey: ['committee-register', unitId] });

  const add = useMutation({
    mutationFn: (officer: NewOfficer) => addOfficer(request, unitId, officer),
    onSuccess: ({ invitation }) => {
      setOutcome({ kind: 'added', invitation });
    },
    onError,
    onSettled,
  });
  const update = useMutation({
    mutationFn: (p: { personId: string; name: string; phone: string }) =>
      updatePerson(request, p.personId, { name: p.name, phone: p.phone }),
    onSuccess: () => {
      setOutcome({ kind: 'updated' });
    },
    onError,
    onSettled,
  });
  const end = useMutation({
    mutationFn: (p: { termId: string; endDate: string }) => endTerm(request, p.termId, p.endDate),
    onSuccess: ({ accountLocked }) => {
      setOutcome({ kind: 'ended', accountLocked });
    },
    onError,
    onSettled,
  });
  return { officers, add, update, end, outcome };
}
