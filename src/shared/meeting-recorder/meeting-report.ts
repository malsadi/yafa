import type { MeetingDetail } from './meeting-records';

/**
 * Brief 22 C1 and D-208: the full report — the meeting's details, attendees
 * and their attendance, the original and updated agendas, every comment,
 * and every vote and decision. The original agenda is the items set before
 * the meeting; the updated one adds the points raised in it (D-204).
 */
export type MeetingReport = MeetingDetail;
