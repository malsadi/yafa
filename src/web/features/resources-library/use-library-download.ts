import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { downloadFile } from '../../app/files/download-file';

/** Brief 9.3: save a library file to the device, under its name. */
export function useLibraryDownload() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (p: { path: string; fileName: string }) =>
      downloadFile(() => getToken(), p.path, p.fileName),
  });
}
