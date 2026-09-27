import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { parsePoundsToPence, penceToPoundsText } from '../../../shared/core/parse-pounds';
import type { BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { RefusalAlert } from '../../components/refusal-alert';
import { TextField } from '../../components/text-field';
import { eventPath } from './event-organiser.api';
import { useEventAction } from './use-event-action';

/** D-131 and D-176: a budget line's name and amount in pounds, kept as whole pence (build rule 3). */
export function BudgetLineForm(props: {
  event: EventSummary;
  line?: BudgetLineRecord;
  onDone: () => void;
}) {
  const t = useText().services['event-organiser'];
  const save = useEventAction();
  const [name, setName] = useState(props.line?.name ?? '');
  const [amount, setAmount] = useState(props.line ? penceToPoundsText(props.line.amountPence) : '');
  const [invalid, setInvalid] = useState(false);
  const base = `${eventPath(props.event.unitId, props.event.id)}/budget-lines`;
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const amountPence = parsePoundsToPence(amount);
        setInvalid(amountPence === null);
        if (amountPence === null) return;
        const body = { name, amountPence };
        save.mutate(
          props.line
            ? { path: `${base}/${props.line.id}`, method: 'PUT', body }
            : { path: base, method: 'POST', body },
          { onSuccess: props.onDone },
        );
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <RefusalAlert
        code={invalid ? 'event-organiser.amount-invalid' : null}
        refusals={t.refusals}
      />
      <TextField label={t.account.lineName} value={name} onChange={setName} />
      <TextField label={t.account.lineAmount} value={amount} onChange={setAmount} />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
