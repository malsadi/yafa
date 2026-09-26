import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';

export interface TransferDraft {
  accountId: string;
  toAccountId: string;
  amount: string;
  entryDate: string;
  description: string;
}

/** Brief 17 B3: from one of the unit's open accounts to another, how much, when and why. */
export function TransferFields(props: {
  draft: TransferDraft;
  onChange: (draft: TransferDraft) => void;
  accounts: AccountRecord[];
}) {
  const t = useText().services.treasury.entries;
  const set = (key: keyof TransferDraft) => (value: string) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  const options = (except: string) =>
    props.accounts.filter((a) => a.id !== except).map((a) => ({ value: a.id, label: a.name }));
  return (
    <>
      <SelectField
        label={t.account}
        value={props.draft.accountId}
        onChange={set('accountId')}
        options={options(props.draft.toAccountId)}
      />
      <SelectField
        label={t.toAccount}
        value={props.draft.toAccountId}
        onChange={set('toAccountId')}
        options={options(props.draft.accountId)}
        emptyLabel=""
      />
      <TextField label={t.amount} value={props.draft.amount} onChange={set('amount')} />
      <TextField
        label={t.date}
        type="date"
        value={props.draft.entryDate}
        onChange={set('entryDate')}
      />
      <TextField
        label={t.description}
        value={props.draft.description}
        onChange={set('description')}
      />
    </>
  );
}
