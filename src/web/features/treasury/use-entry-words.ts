import type { AccountRecord, EntryRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** An entry's kind in words, seen from one account — a transfer says to or from which account. */
export function useEntryWords(
  accountId: string,
  accounts: AccountRecord[],
): (entry: EntryRecord) => string {
  const t = useText().services.treasury.entries;
  const name = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? '';
  return (entry) => {
    if (entry.type !== 'transfer') return t.types[entry.type];
    return entry.accountId === accountId
      ? fillText(t.transferTo, { account: name(entry.toAccountId) })
      : fillText(t.transferFrom, { account: name(entry.accountId) });
  };
}
