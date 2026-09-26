import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { BranchRecipientFields } from './branch-recipient-fields';
import { emptyRequestDraft, sendRequestCall } from './request-draft';
import { useRequestUnits } from './use-conversations';
import { useHubAction } from './use-hub-action';

/** Brief 20 B3, P13 and D-168: ask one, several or all other units. */
export function RequestForm(props: { unitId: string; onDone: () => void }) {
  const t = useText().services['communication-hub'];
  const f = t.requests.form;
  const branches = useRequestUnits(props.unitId);
  const send = useHubAction();
  const [draft, setDraft] = useState(emptyRequestDraft);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        send.mutate(sendRequestCall(props.unitId, draft), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={send.error ?? branches.error} refusals={t.refusals} />
      <TextField
        label={f.subject}
        value={draft.subject}
        onChange={(subject) => {
          setDraft({ ...draft, subject });
        }}
      />
      <TextAreaField
        label={f.body}
        value={draft.body}
        onChange={(body) => {
          setDraft({ ...draft, body });
        }}
      />
      <BranchRecipientFields
        labels={f}
        branches={branches.data}
        choice={draft}
        onChange={(choice) => {
          setDraft({ ...draft, ...choice });
        }}
      />
      <FormButtons
        submit={f.save}
        cancel={f.cancel}
        busy={send.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
