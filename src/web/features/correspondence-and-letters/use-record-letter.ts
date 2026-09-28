import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { uploadFile } from '../../app/files/upload-file';
import { LETTERS_KEY, unitPath } from './correspondence.api';

export interface LetterInDetails {
  dateReceived: string;
  sender: string;
  subject: string;
  handlerPersonId: string;
  answersLetterOutId: string;
}

/** Brief 23 B3 and 9.3: the scan to storage, then the letter recorded, numbered and filed. */
export function useRecordLetter(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const unit = unitPath(unitId);
  return useMutation({
    mutationFn: (p: { file: File; details: LetterInDetails }) =>
      uploadFile<{ id: string }>(
        request,
        {
          start: `${unit}/letters-in/uploads`,
          complete: (started) => `${unit}/letters-in/${String(started.letterId)}`,
        },
        { body: p.file, fileName: p.file.name, contentType: p.file.type },
        { ...p.details, answersLetterOutId: p.details.answersLetterOutId || null },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LETTERS_KEY }),
  });
}
