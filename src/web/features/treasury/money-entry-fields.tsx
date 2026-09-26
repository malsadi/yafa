import type { AccountRecord, BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';

export interface MoneyEntryFormDraft {
  accountId: string;
  amount: string;
  entryDate: string;
  counterparty: string;
  description: string;
  budgetLineId: string;
}

/** Brief 17 B1, B2 and P10: amount, date, account, source or paid to, description, and a budget line. */
export function MoneyEntryFields(props: {
  type: 'credit' | 'debit';
  draft: MoneyEntryFormDraft;
  onChange: (draft: MoneyEntryFormDraft) => void;
  accounts: AccountRecord[];
  budgetLines: BudgetLineRecord[];
}) {
  const t = useText().services.treasury.entries;
  const set = (key: keyof MoneyEntryFormDraft) => (value: string) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  return (
    <>
      <SelectField
        label={t.account}
        value={props.draft.accountId}
        onChange={set('accountId')}
        options={props.accounts.map((a) => ({ value: a.id, label: a.name }))}
      />
      <TextField label={t.amount} value={props.draft.amount} onChange={set('amount')} />
      <TextField
        label={t.date}
        type="date"
        value={props.draft.entryDate}
        onChange={set('entryDate')}
      />
      <TextField
        label={props.type === 'credit' ? t.source : t.paidTo}
        value={props.draft.counterparty}
        onChange={set('counterparty')}
      />
      <TextField
        label={t.description}
        value={props.draft.description}
        onChange={set('description')}
      />
      {props.budgetLines.length > 0 && (
        <SelectField
          label={t.budgetLine}
          value={props.draft.budgetLineId}
          onChange={set('budgetLineId')}
          optional
          emptyLabel=""
          options={props.budgetLines.map((l) => ({ value: l.id, label: l.name }))}
        />
      )}
    </>
  );
}
