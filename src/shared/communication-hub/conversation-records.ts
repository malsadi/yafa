/** Brief 20 B1 to B3 and D-161: a message in a conversation; a removed one keeps its place, without its text. */
export interface HubMessage {
  id: string;
  authorName: string;
  /** The author's units now — or, for a request's reply, the branch they wrote for. */
  authorUnitsEn: string | null;
  authorUnitsAr: string | null;
  body: string | null;
  sentAt: string;
  removed: boolean;
  mine: boolean;
}

/** Brief 20 B1 and D-158: a role network the officer belongs to, by holding its role now. */
export interface RoleNetwork {
  roleId: string;
  nameEn: string;
  nameAr: string;
}

/** Brief 20 B2 and D-159: a topic discussion the officer was invited to. */
export interface DiscussionSummary {
  id: string;
  subject: string;
  startedByName: string;
  startedAt: string;
  startedByMe: boolean;
  members: { personId: string; name: string }[];
}

/** An officer who can be invited to a discussion: a current officer of any unit. */
export interface DiscussionInvitee {
  personId: string;
  name: string;
  unitsEn: string;
  unitsAr: string;
}

/** Brief 20 B3: a request's status. */
export const REQUEST_STATUSES = ['Open', 'Answered', 'Closed'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Brief 20 B3, P13, D-160 and D-168: a request between units, as one of its units sees it. */
export interface HubRequestRecord {
  id: string;
  direction: 'sent' | 'received';
  fromUnitId: string;
  fromUnitNameEn: string;
  fromUnitNameAr: string;
  subject: string;
  body: string;
  toAllBranches: boolean;
  status: RequestStatus;
  createdByName: string;
  createdAt: string;
  recipients: { unitId: string; nameEn: string; nameAr: string }[];
}
