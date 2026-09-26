import type { AccountRecord, EntryRecord } from '../../../shared/treasury/treasury-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { ApprovalDecision } from './approval-decision';
import { EntryPeople } from './entry-people';
import { useEntryWords } from './use-entry-words';
import { useFormatMoney } from './use-format-money';

/** Brief 17 B5 and P7: one debit or transfer awaiting a second officer's decision. */
export function ApprovalItem(props: {
  unitId: string;
  entry: EntryRecord;
  accounts: AccountRecord[];
}) {
  const date = useFormatDate();
  const money = useFormatMoney();
  const words = useEntryWords(props.entry.accountId, props.accounts);
  const { entry } = props;
  const account = props.accounts.find((a) => a.id === entry.accountId)?.name ?? '';
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p className="font-medium">
        {date(entry.entryDate)} · {account} · {words(entry)} · {money(entry.amountPence)}
      </p>
      {(entry.counterparty ?? entry.description) && (
        <p>{[entry.counterparty, entry.description].filter(Boolean).join(' — ')}</p>
      )}
      <EntryPeople entry={entry} />
      <ApprovalDecision unitId={props.unitId} entry={entry} accounts={props.accounts} />
    </li>
  );
}
