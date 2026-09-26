import { useState } from 'react';
import type { LoanDetails } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { TextField } from '../../components/text-field';
import { EditFormButtons } from './edit-form-buttons';

interface LoanFormProps {
  initial: LoanDetails;
  busy: boolean;
  error: Error | null;
  onSave: (loan: LoanDetails) => void;
  onCancel: () => void;
}

/** Brief 16 C2, P20 and D-109: the borrower, how many, the date borrowed and when it is due back. */
export function LoanForm(props: LoanFormProps) {
  const t = useText().services['resources-library'].equipment;
  const [loan, setLoan] = useState({ ...props.initial, quantity: String(props.initial.quantity) });
  const set = (key: keyof typeof loan) => (value: string) => {
    setLoan((current) => ({ ...current, [key]: value }));
  };
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave({ ...loan, quantity: Number(loan.quantity) });
      }}
    >
      <ErrorAlert error={props.error} refusals={t.refusals} />
      <TextField label={t.borrower} value={loan.borrower} onChange={set('borrower')} />
      <TextField
        label={t.quantity}
        type="number"
        value={loan.quantity}
        onChange={set('quantity')}
      />
      <TextField
        label={t.borrowedOn}
        type="date"
        value={loan.borrowedOn}
        onChange={set('borrowedOn')}
      />
      <TextField label={t.dueBack} type="date" value={loan.dueBack} onChange={set('dueBack')} />
      <EditFormButtons labels={t} busy={props.busy} onCancel={props.onCancel} />
    </form>
  );
}
