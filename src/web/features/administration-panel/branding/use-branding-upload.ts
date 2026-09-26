import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BrandingFileSlot } from '../../../../shared/administration-panel/branding-files';
import { useApiRequest } from '../../../app/api/use-api-request';
import { squarePng } from '../../../app/files/square-png';
import { uploadFile } from '../../../app/files/upload-file';
import { BRANDING_QUERY_KEY } from '../../../app/session/use-branding';
import { fileTypeOf } from './font-type';

const base = (slot: BrandingFileSlot) => `/api/administration-panel/branding/files/${slot}`;

/**
 * Brief 25 C3 and 9.3: upload a branding file. The icon is one square image,
 * uploaded as the two sizes phones need (D-084).
 */
export function useBrandingUpload() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const send = (slot: BrandingFileSlot, body: Blob, fileName: string, contentType: string) =>
    uploadFile(
      request,
      { start: `${base(slot)}/uploads`, complete: base(slot) },
      { body, fileName, contentType },
    );
  return useMutation({
    mutationFn: async (p: { slot: 'logo' | 'icon' | 'latin-font' | 'arabic-font'; file: File }) => {
      if (p.slot !== 'icon') return send(p.slot, p.file, p.file.name, fileTypeOf(p.file));
      for (const size of [192, 512] as const) {
        await send(
          `icon-${String(size)}` as BrandingFileSlot,
          await squarePng(p.file, size),
          `icon-${String(size)}.png`,
          'image/png',
        );
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: BRANDING_QUERY_KEY }),
  });
}
