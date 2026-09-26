import type { LoanHistoryEntry } from '../../../shared/resources-library/equipment';
import { useFormatDate } from '../../app/language/use-format-date';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** D-109: every state of a loan, in order — as lent, each correction, and its return. */
export function LoanHistory({ history }: { history: LoanHistoryEntry[] }) {
  const t = useText().services['resources-library'].equipment;
  const formatDate = useFormatDate();
  const formatTimestamp = useFormatTimestamp();
  return (
    <details className="text-sm">
      <summary>{t.history}</summary>
      <ol className="flex flex-col gap-1 ps-4">
        {history.map((entry) => (
          <li key={`${entry.recordedAt}-${entry.change}`}>
            {fillText(t.historyEntry, {
              change: t.changes[entry.change],
              name: entry.recordedByName ?? '',
              date: formatTimestamp(entry.recordedAt),
              quantity: entry.quantity,
              borrower: entry.borrower,
              borrowed: formatDate(entry.borrowedOn),
              due: formatDate(entry.dueBack),
            })}
          </li>
        ))}
      </ol>
    </details>
  );
}
