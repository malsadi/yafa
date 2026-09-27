/** Brief 20 A1: the automatic posts, from the Event organiser and the Meeting recorder only (10.2). */
// D-190 adds 'event-cancelled', by the owner's decision, beyond 20 A1's three.
export const AUTOMATIC_KINDS = [
  'event-published',
  'event-cancelled',
  'meeting-scheduled',
  'meeting-held',
] as const;
export type AutomaticKind = (typeof AUTOMATIC_KINDS)[number];

/** P11: all officers of the unit, officers holding chosen roles, or named officers. */
export const VOTE_ELIGIBILITIES = ['unit', 'roles', 'named'] as const;
export type VoteEligibility = (typeof VOTE_ELIGIBILITIES)[number];

/** Brief 20 A2, P11, P12 and D-156: a notice's vote, as the reader sees it. */
export interface NoticeVoteView {
  question: string;
  closesOn: string;
  closed: boolean;
  eligibility: VoteEligibility;
  roleIds: string[];
  /** The named voters, for those who manage the Noticeboard; empty otherwise. */
  namedPersonIds: string[];
  options: { id: string; label: string }[];
  /** D-155: once anyone has voted, nothing about the vote changes. */
  hasVotes: boolean;
  mayVote: boolean;
  myOptionId: string | null;
  /** P12 and D-156: counts only, and only once the vote has closed. */
  results: { optionId: string; count: number }[] | null;
}

/** Brief 20 A1: a notice on a unit's Noticeboard. */
export interface NoticeRecord {
  id: string;
  unitId: string;
  source: 'officer' | 'automatic';
  automaticKind: AutomaticKind | null;
  title: string;
  body: string | null;
  aboutDate: string | null;
  retiredAt: string | null;
  version: number;
  createdAt: string;
  /** Who posted an officer's notice; null for an automatic post. */
  postedByName: string | null;
  vote: NoticeVoteView | null;
}

/** The choices when putting a notice to a vote (P11): the unit's roles and current officers. */
export interface VoterChoices {
  roles: { id: string; nameEn: string; nameAr: string }[];
  officers: { personId: string; name: string }[];
}
