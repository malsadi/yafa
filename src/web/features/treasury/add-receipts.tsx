import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { ReceiptPicker } from './receipt-picker';
import { useAddReceipt } from './use-add-receipt';

/** D-123: add receipt photos to a credit or debit already recorded. */
export function AddReceipts(props: { unitId: string; type: 'credit' | 'debit'; entryId: string }) {
  const t = useText().services.treasury;
  const add = useAddReceipt(props.unitId);
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <ErrorAlert error={add.error} refusals={t.refusals} />
      <ReceiptPicker files={files} onChange={setFiles} />
      {files.length > 0 && (
        <button
          type="button"
          disabled={add.isPending}
          className="rounded border border-slate-400 px-3 py-1"
          onClick={() => {
            add.mutate(
              { type: props.type, entryId: props.entryId, files },
              {
                onSuccess: () => {
                  setFiles([]);
                },
              },
            );
          }}
        >
          {t.entries.addReceipt}
        </button>
      )}
    </>
  );
}
