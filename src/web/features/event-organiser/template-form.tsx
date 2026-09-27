import { useState } from 'react';
import type { EventTemplateRecord } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { RefusalAlert } from '../../components/refusal-alert';
import { templateBodyOf, templateDraftOf, templateRequest } from './template-draft';
import { TemplateFields } from './template-fields';
import { useEventAction } from './use-event-action';

/** Brief 21 A3 and D-178: a template added, or changed; events already created keep what they were given. */
export function TemplateForm(props: {
  unitId: string;
  template?: EventTemplateRecord;
  onDone: () => void;
}) {
  const t = useText().services['event-organiser'];
  const save = useEventAction();
  const [draft, setDraft] = useState(templateDraftOf(props.template));
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const body = templateBodyOf(draft);
        setInvalid(body === null);
        if (body)
          save.mutate(templateRequest(props.unitId, body, props.template), {
            onSuccess: props.onDone,
          });
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <RefusalAlert
        code={invalid ? 'event-organiser.amount-invalid' : null}
        refusals={t.refusals}
      />
      <TemplateFields draft={draft} onChange={setDraft} />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
