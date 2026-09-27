import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { StatusMessage } from '../../components/status-message';
import { MeetingClashNotice } from './meeting-clash-notice';
import { meetingDraftOf, scheduleRequest } from './meeting-draft';
import { MeetingFields } from './meeting-fields';
import { OfficerCheckboxes } from './officer-checkboxes';
import { useMeetingAction } from './use-meeting-action';
import { useMeetingChoices, useMeetingUnit } from './use-meeting-queries';

/** Brief 22 A1, A2 and D-198: a new meeting and its attendees, with date clash notices. */
export function NewMeetingPage() {
  const unitId = useMeetingUnit();
  const text = useText();
  const t = text.services['meeting-recorder'];
  const navigate = useNavigate();
  const choices = useMeetingChoices(unitId);
  const schedule = useMeetingAction<{ id: string }>();
  const [draft, setDraft] = useState(meetingDraftOf());
  const [attendees, setAttendees] = useState<string[]>([]);
  if (choices.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (choices.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        schedule.mutate(scheduleRequest(unitId, draft, attendees), {
          onSuccess: (made) => {
            void navigate(`/meeting-recorder/meetings/${made.id}`);
          },
        });
      }}
    >
      <h2 className="text-lg font-semibold">{t.list.add}</h2>
      <ErrorAlert error={schedule.error} refusals={t.refusals} />
      <MeetingFields draft={draft} choices={choices.data} onChange={setDraft} />
      <MeetingClashNotice unitId={unitId} date={draft.date} />
      <OfficerCheckboxes
        legend={t.attendees.heading}
        officers={choices.data.officers}
        chosen={attendees}
        onChange={setAttendees}
      />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={schedule.isPending}
        onCancel={() => {
          void navigate('/meeting-recorder/meetings');
        }}
      />
    </form>
  );
}
