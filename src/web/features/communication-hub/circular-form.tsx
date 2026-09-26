import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { emptyCircularDraft, sendRequest } from './circular-draft';
import { CircularRecipientFields } from './circular-recipient-fields';
import { useHubAction } from './use-hub-action';

/** Brief 20 A3 and D-157: send a circular to all branches or to chosen ones; it can't be changed once sent. */
export function CircularForm(props: { unitId: string; onDone: () => void }) {
  const t = useText().services['communication-hub'];
  const f = t.circulars.form;
  const send = useHubAction();
  const [draft, setDraft] = useState(emptyCircularDraft);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        send.mutate(sendRequest(props.unitId, draft), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={send.error} refusals={t.refusals} />
      <TextField
        label={f.title}
        value={draft.title}
        onChange={(title) => {
          setDraft({ ...draft, title });
        }}
      />
      <TextAreaField
        label={f.body}
        value={draft.body}
        onChange={(body) => {
          setDraft({ ...draft, body });
        }}
      />
      <CircularRecipientFields unitId={props.unitId} draft={draft} onChange={setDraft} />
      <p className="text-sm">{f.final}</p>
      <FormButtons
        submit={f.save}
        cancel={f.cancel}
        busy={send.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
