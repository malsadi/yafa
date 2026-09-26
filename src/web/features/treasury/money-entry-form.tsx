import { useState } from 'react';
import type { AccountRecord, BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { AmountNotes } from './amount-notes';
import { emptyMoneyEntry, moneyEntryOf } from './money-entry-draft';
import { MoneyEntryFields } from './money-entry-fields';
import { ReceiptPicker } from './receipt-picker';
import { SavedEntryNotice } from './saved-entry-notice';
import { useRecordMoneyEntry } from './use-record-money-entry';

interface FormProps {
  unitId: string;
  type: 'credit' | 'debit';
  account: AccountRecord;
  accounts: AccountRecord[];
  budgetLines: BudgetLineRecord[];
  onDone: () => void;
}

/** Brief 17 B1, B2 and B4: record a credit or debit, with its receipt photos. */
export function MoneyEntryForm(props: FormProps) {
  const t = useText().services.treasury;
  const record = useRecordMoneyEntry(props.unitId, props.type);
  const [draft, setDraft] = useState(emptyMoneyEntry(props.account.id));
  const [files, setFiles] = useState<File[]>([]);
  const chosen = props.accounts.find((a) => a.id === draft.accountId) ?? props.account;
  if (record.data)
    return <SavedEntryNotice saved={record.data} accounts={props.accounts} onDone={props.onDone} />;
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const entry = moneyEntryOf(draft);
        if (entry) record.mutate({ entry, files });
      }}
    >
      <h3 className="font-semibold">{t.entries.record[props.type]}</h3>
      <ErrorAlert error={record.error} refusals={t.refusals} />
      <MoneyEntryFields
        type={props.type}
        draft={draft}
        onChange={setDraft}
        accounts={props.accounts}
        budgetLines={props.budgetLines}
      />
      <AmountNotes amount={draft.amount} outOf={props.type === 'debit' ? chosen : null} />
      <ReceiptPicker files={files} onChange={setFiles} />
      <FormButtons
        submit={t.entries.save}
        cancel={t.entries.cancel}
        busy={record.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
