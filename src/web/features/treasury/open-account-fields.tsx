import { BRANCH_ACCOUNT_TYPES } from '../../../shared/treasury/treasury-statuses';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';

export interface OpenAccountDraft {
  name: string;
  branchType: string;
  opening: string;
  openingDate: string;
}

/** D-117 and D-119: a branch account's name, bank or cash, opening balance and opening date. */
export function OpenAccountFields(props: {
  draft: OpenAccountDraft;
  onChange: (draft: OpenAccountDraft) => void;
}) {
  const t = useText().services.treasury.accounts;
  const set = (key: keyof OpenAccountDraft) => (value: string) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  return (
    <>
      <TextField label={t.name} value={props.draft.name} onChange={set('name')} />
      <SelectField
        label={t.type}
        value={props.draft.branchType}
        onChange={set('branchType')}
        options={BRANCH_ACCOUNT_TYPES.map((k) => ({ value: k, label: t.kinds[k] }))}
      />
      <TextField label={t.openingBalance} value={props.draft.opening} onChange={set('opening')} />
      <TextField
        label={t.openingDate}
        type="date"
        value={props.draft.openingDate}
        onChange={set('openingDate')}
      />
    </>
  );
}
