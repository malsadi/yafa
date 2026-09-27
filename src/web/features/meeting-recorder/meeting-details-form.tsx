import { useState } from 'react';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { StatusMessage } from '../../components/status-message';
import { MeetingClashNotice } from './meeting-clash-notice';
import { changeRequest, meetingDraftOf } from './meeting-draft';
import { MeetingFields } from './meeting-fields';
import { useMeetingAction } from './use-meeting-action';
import { useMeetingChoices } from './use-meeting-queries';

/** D-202: the details changed while scheduled, from the version read (9.1). */
export function MeetingDetailsForm(props: { meeting: MeetingSummary; onDone: () => void }) {
  const text = useText();
  const t = text.services['meeting-recorder'];
  const choices = useMeetingChoices(props.meeting.unitId);
  const save = useMeetingAction();
  const [draft, setDraft] = useState(meetingDraftOf(props.meeting));
  if (!choices.data) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(changeRequest(props.meeting, draft), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error} refusals={t.refusals} />
      <MeetingFields draft={draft} choices={choices.data} onChange={setDraft} />
      <MeetingClashNotice
        unitId={props.meeting.unitId}
        date={draft.date}
        meetingId={props.meeting.id}
      />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
