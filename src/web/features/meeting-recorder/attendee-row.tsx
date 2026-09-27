import type { AttendeeRecord } from '../../../shared/meeting-recorder/meeting-records';
import {
  ATTENDANCE_MARKS,
  type Attendance,
} from '../../../shared/meeting-recorder/meeting-statuses';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';

/** Brief 22 A2 and D-203: one attendee — marked while the meeting is held, removable while allowed. */
export function AttendeeRow(props: {
  attendee: AttendeeRecord;
  marks: boolean;
  removable: boolean;
  busy: boolean;
  onMark: (attendance: Attendance) => void;
  onRemove: () => void;
}) {
  const t = useText().services['meeting-recorder'];
  const { attendee } = props;
  return (
    <li className="flex flex-wrap items-center gap-2">
      <span>{attendee.name}</span>
      {props.marks ? (
        <select
          aria-label={`${t.attendees.mark} ${attendee.name ?? ''}`}
          className="rounded border border-slate-400 p-1"
          value={attendee.attendance ?? ''}
          onChange={(e) => {
            props.onMark(e.target.value as Attendance);
          }}
        >
          <option value="" disabled>
            {t.attendees.notMarked}
          </option>
          {ATTENDANCE_MARKS.map((m) => (
            <option key={m} value={m}>
              {t.attendance[m]}
            </option>
          ))}
        </select>
      ) : (
        attendee.attendance && (
          <span className="text-slate-600">{t.attendance[attendee.attendance]}</span>
        )
      )}
      {props.removable && (
        <ActionButton label={t.attendees.remove} disabled={props.busy} onClick={props.onRemove} />
      )}
    </li>
  );
}
