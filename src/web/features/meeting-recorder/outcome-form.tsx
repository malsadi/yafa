import { useState } from 'react';
import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { RefusalAlert } from '../../components/refusal-alert';
import { outcomeBodyOf, outcomeDraftOf } from './outcome-draft';
import { OutcomeFields } from './outcome-fields';
import { useMeetingAction } from './use-meeting-action';

/** Brief 22 B2 and D-206: the item's vote (numbers and result) or its decision. */
export function OutcomeForm(props: { path: string; item: AgendaItemRecord }) {
  const t = useText().services['meeting-recorder'];
  const save = useMeetingAction();
  const [draft, setDraft] = useState(outcomeDraftOf(props.item));
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      className="flex flex-col gap-2 rounded bg-slate-50 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const outcome = outcomeBodyOf(draft);
        setInvalid(outcome === null);
        if (outcome)
          save.mutate({
            path: props.path,
            method: 'PUT',
            body: { outcome, version: props.item.version },
          });
      }}
    >
      <OutcomeFields draft={draft} onChange={setDraft} />
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <RefusalAlert
        code={invalid ? 'meeting-recorder.count-invalid' : null}
        refusals={t.refusals}
      />
      <button
        type="submit"
        className="self-start rounded bg-slate-800 px-3 py-1 text-white"
        disabled={save.isPending}
      >
        {t.outcome.save}
      </button>
    </form>
  );
}
