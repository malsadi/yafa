import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useApiRequest } from '../../../app/api/use-api-request';
import { fetchAccessCheck, fetchPeople } from './access-check.api';

const KEY = ['access-check'] as const;

/** Brief 25 A4: the people to choose from, and the chosen one's permissions. */
export function useAccessCheck() {
  const request = useApiRequest();
  const [personId, setPersonId] = useState('');
  const people = useQuery({ queryKey: [...KEY, 'people'], queryFn: () => fetchPeople(request) });
  const check = useQuery({
    queryKey: [...KEY, personId],
    queryFn: () => fetchAccessCheck(request, personId),
    enabled: personId !== '',
  });
  return { people, personId, setPersonId, check };
}
