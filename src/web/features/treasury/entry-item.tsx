import type { AccountRecord, EntryRecord } from '../../../shared/treasury/treasury-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { CorrectEntry } from './correct-entry';
import { EntryPeople } from './entry-people';
import { EntryReceipts } from './entry-receipts';
import { EntryStatusBadge } from './entry-status-badge';
import { useEntryWords } from './use-entry-words';
import { useFormatMoney } from './use-format-money';

/** Brief 17 B: one entry on an account — in or out, its status, who, its receipts, and correcting it. */
export function EntryItem(props: {
  unitId: string;
  accountId: string;
  entry: EntryRecord;
  accounts: AccountRecord[];
}) {
  const t = useText().services.treasury.entries;
  const { context } = useActiveSession();
  const date = useFormatDate();
  const money = useFormatMoney();
  const words = useEntryWords(props.accountId, props.accounts);
  const { entry } = props;
  const outgoing =
    entry.type === 'debit' || (entry.type === 'transfer' && entry.accountId === props.accountId);
  const counts = entry.approvalStatus === 'Not needed' || entry.approvalStatus === 'Approved';
  const correctable =
    counts &&
    !entry.reversesEntryId &&
    !entry.reversedByEntryId &&
    context.capabilities.includes('treasury.entries.correct');
  return (
    <li
      className={`flex flex-col gap-1 rounded border border-slate-300 p-3 ${counts ? '' : 'opacity-75'}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>{date(entry.entryDate)}</span>
        <span className="font-medium">{words(entry)}</span>
        <EntryStatusBadge status={entry.approvalStatus} />
        <span className={`ms-auto font-medium ${outgoing ? 'text-red-700' : ''}`}>
          {outgoing ? '−' : '+'}
          {money(Math.abs(entry.amountPence))}
        </span>
      </div>
      {(entry.counterparty ?? entry.description) && (
        <p>{[entry.counterparty, entry.description].filter(Boolean).join(' — ')}</p>
      )}
      {entry.reversesEntryId && <p className="text-sm">{t.reversalOf}</p>}
      {entry.reversedByEntryId && <p className="text-sm">{t.reversedBy}</p>}
      <EntryPeople entry={entry} />
      {(entry.type === 'credit' || entry.type === 'debit') && (
        <EntryReceipts unitId={props.unitId} entry={{ ...entry, type: entry.type }} />
      )}
      {correctable && <CorrectEntry unitId={props.unitId} entryId={entry.id} />}
    </li>
  );
}
