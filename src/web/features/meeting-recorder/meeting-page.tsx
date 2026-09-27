import { useParams } from 'react-router';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { AgendaPanel } from './agenda-panel';
import { AttendeesPanel } from './attendees-panel';
import { MeetingDetailsPanel } from './meeting-details-panel';
import { MeetingStatusPanel } from './meeting-status-panel';
import { MeetingTargetsPanel } from './meeting-targets-panel';
import { MinutesPanel } from './minutes-panel';
import { MinutesRecord } from './minutes-record';
import { useMeetingHints } from './meeting-hints';
import { useMeeting, useMeetingUnit } from './use-meeting-queries';

/** Brief 22: one meeting — details, status, attendees, agenda, minutes and report. */
export function MeetingPage() {
  const unitId = useMeetingUnit();
  const { meetingId = '' } = useParams();
  const text = useText();
  const t = text.services['meeting-recorder'];
  const detail = useMeeting(unitId, meetingId);
  if (detail.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (detail.isError)
    return <StatusMessage>{t.refusals['meeting-recorder.meeting-not-found']}</StatusMessage>;
  return <MeetingSections detail={detail.data} />;
}

function MeetingSections({
  detail,
}: {
  detail: NonNullable<ReturnType<typeof useMeeting>['data']>;
}) {
  const hints = useMeetingHints(detail.meeting);
  const { status } = detail.meeting;
  return (
    <div className="flex flex-col gap-6">
      <MeetingDetailsPanel meeting={detail.meeting} />
      <MeetingStatusPanel detail={detail} />
      <MeetingTargetsPanel meeting={detail.meeting} />
      <AttendeesPanel detail={detail} />
      <AgendaPanel detail={detail} />
      {hints.records && <MinutesPanel detail={detail} />}
      {!hints.records && status !== 'Scheduled' && status !== 'Cancelled' && (
        <MinutesRecord detail={detail} />
      )}
    </div>
  );
}
