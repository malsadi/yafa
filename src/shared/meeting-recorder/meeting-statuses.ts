/**
 * Brief 22: a meeting's status — Scheduled → Held → Report logged. D-202
 * adds Cancelled, from Scheduled only, for a meeting that doesn't happen.
 */
export const MeetingStatus = {
  Scheduled: 'Scheduled',
  Held: 'Held',
  ReportLogged: 'Report logged',
  Cancelled: 'Cancelled',
} as const;

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

export const MEETING_STATUSES: readonly MeetingStatus[] = Object.values(MeetingStatus);

/** Brief 22 A2 and D-203: each attendee is marked present, sending apologies, or did not attend. */
export const Attendance = {
  Present: 'Present',
  Apologies: 'Apologies',
  DidNotAttend: 'Did not attend',
} as const;

export type Attendance = (typeof Attendance)[keyof typeof Attendance];

export const ATTENDANCE_MARKS: readonly Attendance[] = Object.values(Attendance);

/** Brief 22 B2 and D-206: an agenda item concludes with a vote or a decision. */
export const OutcomeKind = { Vote: 'vote', Decision: 'decision' } as const;

export type OutcomeKind = (typeof OutcomeKind)[keyof typeof OutcomeKind];
