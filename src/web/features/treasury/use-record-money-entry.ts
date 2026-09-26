import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavedEntry } from '../../../shared/treasury/treasury-records';
import { useApiRequest } from '../../app/api/use-api-request';
import { useActiveSession } from '../../app/session/use-active-session';
import { sendReceiptPhotos } from './receipt-photos';
import { post, treasuryPath } from './treasury.api';
import { treasuryKey } from './treasury-keys';

export interface MoneyEntryDraft {
  accountId: string;
  amountPence: number;
  entryDate: string;
  counterparty: string;
  description: string;
  budgetLineId: string | null;
}

/** Brief 17 B1, B2 and B4: record a credit or debit, its receipt photos sent first. */
export function useRecordMoneyEntry(unitId: string, type: 'credit' | 'debit') {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const { photoMaxDimensionPx } = useActiveSession();
  return useMutation({
    mutationFn: async (p: { entry: MoneyEntryDraft; files: File[] }) => {
      const startPath = `${treasuryPath(unitId)}/${type}s/receipts/uploads`;
      const { entryId, receipts } = await sendReceiptPhotos(request, {
        startPath,
        files: p.files,
        maxDimension: photoMaxDimensionPx,
      });
      return post<SavedEntry>(request, unitId, `/${type}s`, {
        ...p.entry,
        ...(entryId ? { entryId } : {}),
        receipts,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: treasuryKey(unitId) }),
  });
}
