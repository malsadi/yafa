import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { uploadFile } from '../../app/files/upload-file';
import { ARCHIVE } from './archive.api';

export interface ArchiveUploadDetails {
  categoryId: string;
  title: string;
  description: string;
  documentDate: string;
}

/** Brief 15 A2 and 9.3: upload a document to a unit's archive (D-096, D-097). */
export function useArchiveUpload(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const unit = `${ARCHIVE}/units/${unitId}`;
  return useMutation({
    mutationFn: (p: { file: File; details: ArchiveUploadDetails }) =>
      uploadFile<{ documentId: string }>(
        request,
        {
          start: `${unit}/uploads`,
          complete: (started) => `${unit}/documents/${String(started.documentId)}`,
        },
        { body: p.file, fileName: p.file.name, contentType: p.file.type },
        { ...p.details },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['documents-archive', 'documents'] }),
  });
}
