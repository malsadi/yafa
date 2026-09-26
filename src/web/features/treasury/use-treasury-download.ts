import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { downloadFile } from '../../app/files/download-file';

/** Brief 9.3: save a Treasury file — a receipt photo or a statement — to the device. */
export function useTreasuryDownload() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (p: { path: string; fileName: string }) =>
      downloadFile(() => getToken(), p.path, p.fileName),
  });
}
