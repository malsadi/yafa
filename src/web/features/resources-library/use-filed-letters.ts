import { useAuth } from '@clerk/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { LetterDirection } from '../../../shared/resources-library/filed-letter';
import { useApiRequest } from '../../app/api/use-api-request';
import { downloadFile } from '../../app/files/download-file';
import { fetchFiledLetters, filedLetterFilePath } from './library.api';

/** Brief 16 D2, D3: a unit's letters out or in, and saving one to the device. */
export function useFiledLetters(unitId: string, direction: LetterDirection) {
  const request = useApiRequest();
  const { getToken } = useAuth();
  const letters = useQuery({
    queryKey: ['resources-library', unitId, 'letters', direction],
    queryFn: () => fetchFiledLetters(request, unitId, direction),
  });
  const download = useMutation({
    mutationFn: (p: { id: string; fileName: string }) =>
      downloadFile(() => getToken(), filedLetterFilePath(unitId, direction, p.id), p.fileName),
  });
  return { letters, download };
}
