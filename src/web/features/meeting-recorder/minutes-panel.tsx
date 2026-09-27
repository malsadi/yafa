import type { MeetingDetail } from '../../../shared/meeting-recorder/meeting-records';
import { useText } from '../../app/language/use-text';
import { CommentField } from './comment-field';
import { meetingPath } from './meeting-recorder.api';
import { OutcomeForm } from './outcome-form';
import { useMeetingChoices } from './use-meeting-queries';

/**
 * Brief 22 B1, B2 and D-205 to D-207: the minutes, item by item — each
 * present officer's comment, saving itself, and the vote or decision.
 */
export function MinutesPanel({ detail }: { detail: MeetingDetail }) {
  const t = useText().services['meeting-recorder'];
  const { meeting } = detail;
  const seconds = useMeetingChoices(meeting.unitId).data?.autosaveSeconds ?? null;
  const present = detail.attendees.filter((a) => a.attendance === 'Present');
  const base = meetingPath(meeting.unitId, meeting.id);
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-semibold">{t.minutes.heading}</h3>
      {detail.agenda.map((item) => (
        <div key={item.id} className="flex flex-col gap-2 rounded border border-slate-300 p-3">
          <h4 className="font-medium">{item.title}</h4>
          {present.map((a) => (
            <CommentField
              key={`${item.id}-${a.personId}`}
              path={`${base}/agenda/${item.id}/comments/${a.personId}`}
              name={a.name ?? ''}
              current={item.comments.find((c) => c.personId === a.personId)}
              autosaveSeconds={seconds}
            />
          ))}
          <OutcomeForm
            key={`${item.id}-${String(item.version)}`}
            path={`${base}/agenda/${item.id}/outcome`}
            item={item}
          />
        </div>
      ))}
    </section>
  );
}
