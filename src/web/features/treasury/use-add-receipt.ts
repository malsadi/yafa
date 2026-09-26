import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { useActiveSession } from '../../app/session/use-active-session';
import { sendReceiptPhotos } from './receipt-photos';
import { treasuryPath } from './treasury.api';
import { treasuryKey } from './treasury-keys';

/** D-123: add receipt photos to a credit or debit already recorded; the entry itself never changes. */
export function useAddReceipt(unitId: string) {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const { photoMaxDimensionPx } = useActiveSession();
  return useMutation({
    mutationFn: async (p: { type: 'credit' | 'debit'; entryId: string; files: File[] }) => {
      const base = `${treasuryPath(unitId)}/${p.type}s/${p.entryId}/receipts`;
      const { receipts } = await sendReceiptPhotos(request, {
        startPath: `${base}/uploads`,
        files: p.files,
        maxDimension: photoMaxDimensionPx,
        entryId: p.entryId,
      });
      for (const receipt of receipts) await request(base, { method: 'PUT', body: receipt });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: treasuryKey(unitId) }),
  });
}
