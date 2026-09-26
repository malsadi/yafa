import { useState } from 'react';
import { parsePoundsToPence } from '../../../shared/core/parse-pounds';
import type { AccountRecord, SavedEntry } from '../../../shared/treasury/treasury-records';
import { todayInLondon } from '../../app/language/today-in-london';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { AmountNotes } from './amount-notes';
import { SavedEntryNotice } from './saved-entry-notice';
import { TransferFields } from './transfer-fields';
import { useTreasuryAction } from './use-treasury-action';

/** Brief 17 B3 and D-122: move money between two of the unit's open accounts, in one record. */
export function TransferForm(props: {
  unitId: string;
  account: AccountRecord;
  accounts: AccountRecord[];
  onDone: () => void;
}) {
  const t = useText().services.treasury;
  const transfer = useTreasuryAction<SavedEntry>(props.unitId);
  const [draft, setDraft] = useState({
    accountId: props.account.id,
    toAccountId: '',
    amount: '',
    entryDate: todayInLondon(),
    description: '',
  });
  const from = props.accounts.find((a) => a.id === draft.accountId) ?? null;
  if (transfer.data)
    return (
      <SavedEntryNotice saved={transfer.data} accounts={props.accounts} onDone={props.onDone} />
    );
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const amountPence = parsePoundsToPence(draft.amount);
        if (amountPence === null) return;
        const body = {
          accountId: draft.accountId,
          toAccountId: draft.toAccountId,
          amountPence,
          entryDate: draft.entryDate,
          description: draft.description,
        };
        transfer.mutate({ path: '/transfers', body });
      }}
    >
      <h3 className="font-semibold">{t.entries.record.transfer}</h3>
      <ErrorAlert error={transfer.error} refusals={t.refusals} />
      <TransferFields draft={draft} onChange={setDraft} accounts={props.accounts} />
      <AmountNotes amount={draft.amount} outOf={from} />
      <FormButtons
        submit={t.entries.save}
        cancel={t.entries.cancel}
        busy={transfer.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
