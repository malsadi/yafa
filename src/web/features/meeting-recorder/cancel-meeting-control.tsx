import { useState } from 'react';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { TextField } from '../../components/text-field';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';

/** D-202: a meeting that doesn't happen, cancelled with a reason; it sends no hub message. */
export function CancelMeetingControl({ meeting }: { meeting: MeetingSummary }) {
  const t = useText().services['meeting-recorder'];
  const cancel = useMeetingAction();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  if (!open)
    return (
      <ActionButton
        label={t.status.cancel}
        onClick={() => {
          setOpen(true);
        }}
      />
    );
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const path = `${meetingPath(meeting.unitId, meeting.id)}/cancel`;
        cancel.mutate(
          { path, method: 'POST', body: { reason, version: meeting.version } },
          {
            onSuccess: () => {
              setOpen(false);
            },
          },
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
        onCancel={() => {
          setOpen(false);
        }}
      />
    </form>
  );
}
