import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { meetingPath, unitPath } from './meeting-recorder.api';

/** Brief 22 A1 and D-198: a meeting's form, as typed. */
export interface MeetingDraft {
  typeItemId: string;
  date: string;
  startTime: string;
  place: string;
  onlineLink: string;
  chairPersonId: string;
  secretaryPersonId: string;
}

export function meetingDraftOf(meeting?: MeetingSummary): MeetingDraft {
  return {
    typeItemId: meeting?.typeItemId ?? '',
    date: meeting?.date ?? '',
    startTime: meeting?.startTime ?? '',
    place: meeting?.place ?? '',
    onlineLink: meeting?.onlineLink ?? '',
    chairPersonId: meeting?.chairPersonId ?? '',
    secretaryPersonId: meeting?.secretaryPersonId ?? '',
  };
}

/** Brief 22 A1 and A2: a new meeting, with the attendees chosen. */
export function scheduleRequest(unitId: string, draft: MeetingDraft, attendeePersonIds: string[]) {
  return {
    path: `${unitPath(unitId)}/meetings`,
    method: 'POST' as const,
    body: { meeting: draft, attendeePersonIds },
  };
}

/** D-202 and 9.1: the details changed while scheduled, from the version read. */
export function changeRequest(meeting: MeetingSummary, draft: MeetingDraft) {
  return {
    path: meetingPath(meeting.unitId, meeting.id),
    method: 'PUT' as const,
    body: { meeting: draft, version: meeting.version },
  };
}
