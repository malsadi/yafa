import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { downloadFile } from '../../app/files/download-file';
import { versionFilePath } from './archive.api';

/** Brief 15 B2: save one version of a document to the device. */
export function useArchiveDownload(documentId: string) {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (p: { version: number; fileName: string }) =>
      downloadFile(() => getToken(), versionFilePath(documentId, p.version), p.fileName),
  });
}
