import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useActiveSession } from '../../app/session/use-active-session';

/**
 * What the meeting screen offers this officer — hints only (T-042): the
 * portal decides each request itself. The chair and secretary record the
 * minutes and log the report with no capability (D-200).
 */
export function useMeetingHints(meeting: MeetingSummary) {
  const { context } = useActiveSession();
  const manages = context.capabilities.includes('meeting-recorder.meetings.manage');
  const chairs =
    meeting.chairPersonId === context.personId || meeting.secretaryPersonId === context.personId;
  return {
    sets: manages && meeting.status === 'Scheduled',
    manages,
    records: (manages || chairs) && meeting.status === 'Held',
    holds: (manages || chairs) && meeting.status === 'Scheduled',
    attendeesChange: manages && (meeting.status === 'Scheduled' || meeting.status === 'Held'),
  };
}
