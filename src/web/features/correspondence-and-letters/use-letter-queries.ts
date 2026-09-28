import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  fetchLetterIn,
  fetchLetterOut,
  fetchLettersIn,
  fetchLettersOut,
  fetchRecordingChoices,
  fetchWritingChoices,
  LETTERS_KEY,
} from './correspondence.api';

/** The selected unit whose letters are open, from the layout. */
export const useLetterUnit = (): string => useOutletContext<string>();

function useLetterQuery<T>(unitId: string, part: string[], fetch: () => Promise<T>) {
  return useQuery({ queryKey: [...LETTERS_KEY, unitId, ...part], queryFn: fetch });
}

export function useLettersOut(unitId: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['out'], () => fetchLettersOut(request, unitId));
}

export function useLetterOut(unitId: string, id: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['out', id], () => fetchLetterOut(request, unitId, id));
}

export function useLettersIn(unitId: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['in'], () => fetchLettersIn(request, unitId));
}

export function useLetterIn(unitId: string, id: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['in', id], () => fetchLetterIn(request, unitId, id));
}

export function useWritingChoices(unitId: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['writing'], () => fetchWritingChoices(request, unitId));
}

export function useRecordingChoices(unitId: string) {
  const request = useApiRequest();
  return useLetterQuery(unitId, ['recording'], () => fetchRecordingChoices(request, unitId));
}
