import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { uploadFile } from '../../app/files/upload-file';
import { ARCHIVE } from './archive.api';

/** Brief 15 A4 and D-110: add a new version, with its own date, to an uploaded document. */
export function useVersionUpload(unitId: string, documentId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const versions = `${ARCHIVE}/units/${unitId}/documents/${documentId}/versions`;
  return useMutation({
    mutationFn: (p: { file: File; documentDate: string }) =>
      uploadFile(
        request,
        { start: `${versions}/uploads`, complete: versions },
        { body: p.file, fileName: p.file.name, contentType: p.file.type },
        { documentDate: p.documentDate },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents-archive'] }),
  });
}
