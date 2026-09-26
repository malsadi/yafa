import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';

/** P7: declining needs a reason, kept with the entry. */
export function DeclineForm(props: {
  busy: boolean;
  onDecline: (reason: string) => void;
  onCancel: () => void;
}) {
  const t = useText().services.treasury;
  const [reason, setReason] = useState('');
  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onDecline(reason);
      }}
    >
      <TextField label={t.approvals.reason} value={reason} onChange={setReason} />
      <FormButtons
        submit={t.approvals.confirmDecline}
        cancel={t.entries.cancel}
        busy={props.busy}
        onCancel={props.onCancel}
      />
    </form>
  );
}
