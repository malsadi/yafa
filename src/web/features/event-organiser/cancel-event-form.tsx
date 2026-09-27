import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';
import { eventPath } from './event-organiser.api';
import { useEventAction } from './use-event-action';

/** D-181: cancelling an event, for good, with its reason; it is then closed in the usual way. */
export function CancelEventForm(props: { event: EventSummary; onDone: () => void }) {
  const t = useText().services['event-organiser'];
  const cancel = useEventAction();
  const [reason, setReason] = useState('');
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        cancel.mutate(
          {
            path: `${eventPath(props.event.unitId, props.event.id)}/cancel`,
            method: 'POST',
            body: { reason, version: props.event.version },
          },
          { onSuccess: props.onDone },
        );
      }}
    >
      <p className="text-sm">{t.status.cancelWarning}</p>
      <ErrorAlert error={cancel.error} refusals={t.refusals} />
      <TextField label={t.status.reason} value={reason} onChange={setReason} />
      <FormButtons
        submit={t.status.confirmCancel}
        cancel={t.form.cancel}
        busy={cancel.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
