import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { unitHubPath } from './hub.api';
import { InviteeCheckboxes } from './invitee-checkboxes';
import { useHubAction } from './use-hub-action';

/** Brief 20 B2 and D-159: start a discussion — its subject, first message and the officers invited. */
export function DiscussionForm(props: { unitId: string; selfId: string; onDone: () => void }) {
  const t = useText().services['communication-hub'];
  const f = t.discussions.form;
  const start = useHubAction();
  const [draft, setDraft] = useState({ subject: '', body: '', personIds: [] as string[] });
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        start.mutate(
          { path: `${unitHubPath(props.unitId)}/discussions`, method: 'POST', body: draft },
          { onSuccess: props.onDone },
        );
      }}
    >
      <ErrorAlert error={start.error} refusals={t.refusals} />
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
      <InviteeCheckboxes
        unitId={props.unitId}
        legend={f.invitees}
        exclude={[props.selfId]}
        chosen={draft.personIds}
        onChange={(personIds) => {
          setDraft({ ...draft, personIds });
        }}
      />
      <FormButtons
        submit={f.save}
        cancel={f.cancel}
        busy={start.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
