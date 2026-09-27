import type { MeetingDetail } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { AddAttendees } from './add-attendees';
import { AttendeeRow } from './attendee-row';
import { useMeetingHints } from './meeting-hints';
import { meetingPath } from './meeting-recorder.api';
import { useMeetingAction } from './use-meeting-action';

/**
 * Brief 22 A2 and D-203: the attendees — chosen from the unit's officers
 * — and, while the meeting is held, each marked present, sending apologies,
 * or did not attend. The chair and secretary always attend.
 */
export function AttendeesPanel({ detail }: { detail: MeetingDetail }) {
  const t = useText().services['meeting-recorder'];
  const { meeting } = detail;
  const hints = useMeetingHints(meeting);
  const act = useMeetingAction();
  const base = `${meetingPath(meeting.unitId, meeting.id)}/attendees`;
  const fixed = [meeting.chairPersonId, meeting.secretaryPersonId];
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.attendees.heading}</h3>
      <ErrorAlert error={act.error} refusals={t.refusals} />
      <ul className="flex flex-col gap-1 text-sm">
        {detail.attendees.map((a) => (
          <AttendeeRow
            key={a.personId}
            attendee={a}
            marks={hints.records}
            removable={hints.attendeesChange && !fixed.includes(a.personId)}
            busy={act.isPending}
            onMark={(attendance) => {
              act.mutate({
                path: `${base}/${a.personId}/attendance`,
                method: 'PUT',
                body: { attendance },
              });
            }}
            onRemove={() => {
              act.mutate({ path: `${base}/${a.personId}/remove`, method: 'POST' });
            }}
          />
        ))}
      </ul>
      {hints.attendeesChange && (
        <AddAttendees meeting={meeting} attending={detail.attendees.map((a) => a.personId)} />
      )}
    </section>
  );
}
