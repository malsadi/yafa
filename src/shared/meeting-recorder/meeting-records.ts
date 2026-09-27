import type { Attendance, MeetingStatus, OutcomeKind } from './meeting-statuses';

/** Brief 22 A1 and D-198: a meeting as the list and screen show it. */
export interface MeetingSummary {
  id: string;
  unitId: string;
  typeItemId: string;
  typeNameEn: string;
  typeNameAr: string;
  date: string;
  startTime: string;
  place: string | null;
  onlineLink: string | null;
  chairPersonId: string;
  chairName: string | null;
  secretaryPersonId: string;
  secretaryName: string | null;
  status: MeetingStatus;
  cancelReason: string | null;
  calendarWrittenAt: string | null;
  scheduledPostedAt: string | null;
  heldPostedAt: string | null;
  loggedAt: string | null;
  version: number;
}

/** Brief 22 A2 and D-203: an attendee, and how they were marked on the day. */
export interface AttendeeRecord {
  personId: string;
  name: string | null;
  attendance: Attendance | null;
}

/** Brief 22 A3, B1, B2: an agenda item, its comments, and its vote or decision. */
export interface AgendaItemRecord {
  id: string;
  position: number;
  title: string;
  note: string | null;
  raisedInMeeting: boolean;
  outcomeKind: OutcomeKind | null;
  votesFor: number | null;
  votesAgainst: number | null;
  votesAbstain: number | null;
  voteResult: string | null;
  decision: string | null;
  version: number;
  comments: { personId: string; name: string | null; comment: string; version: number }[];
}

/** The meeting screen: the meeting, its attendees, and its agenda with the minutes. */
export interface MeetingDetail {
  meeting: MeetingSummary;
  attendees: AttendeeRecord[];
  agenda: AgendaItemRecord[];
}
