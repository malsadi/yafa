import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';

/** Brief 22 A1: when and where the meeting is, and who chairs it and takes the minutes. */
export function MeetingFacts({ meeting }: { meeting: MeetingSummary }) {
  const t = useText().services['meeting-recorder'];
  const date = useFormatDate();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <dt>{t.details.when}</dt>
      <dd>{`${date(meeting.date)}, ${meeting.startTime}`}</dd>
      {meeting.place && (
        <>
          <dt>{t.form.place}</dt>
          <dd>{meeting.place}</dd>
        </>
      )}
      {meeting.onlineLink && (
        <>
          <dt>{t.form.onlineLink}</dt>
          <dd className="break-all">{meeting.onlineLink}</dd>
        </>
      )}
      <dt>{t.form.chair}</dt>
      <dd>{meeting.chairName}</dd>
      <dt>{t.form.secretary}</dt>
      <dd>{meeting.secretaryName}</dd>
    </dl>
  );
}
