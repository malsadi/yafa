import type { EntryRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { AddReceipts } from './add-receipts';
import { treasuryPath } from './treasury.api';
import { useTreasuryDownload } from './use-treasury-download';

/** Brief 17 B4 and D-123: a credit's or debit's receipt photos — to download, or add; "No receipt" informs. */
export function EntryReceipts({
  unitId,
  entry,
}: {
  unitId: string;
  entry: EntryRecord & { type: 'credit' | 'debit' };
}) {
  const t = useText().services.treasury;
  const { context } = useActiveSession();
  const download = useTreasuryDownload();
  // A hint only (T-042): the portal decides each change itself.
  const mayAdd = context.capabilities.includes(`treasury.${entry.type}.create`);
  const path = (receiptId: string) =>
    `${treasuryPath(unitId)}/entries/${entry.id}/receipts/${receiptId}/file`;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <ErrorAlert error={download.error} refusals={t.refusals} />
      {entry.receipts.length === 0 && (
        <span className="rounded bg-amber-100 px-2">{t.entries.noReceipt}</span>
      )}
      {entry.receipts.map((r, i) => (
        <button
          key={r.id}
          type="button"
          className="underline"
          onClick={() => {
            download.mutate({ path: path(r.id), fileName: r.fileName });
          }}
        >
          {fillText(t.entries.download, { number: i + 1 })}
        </button>
      ))}
      {mayAdd && <AddReceipts unitId={unitId} type={entry.type} entryId={entry.id} />}
    </div>
  );
}
