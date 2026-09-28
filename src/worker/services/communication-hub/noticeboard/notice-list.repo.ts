import type {
  AutomaticKind,
  VoteEligibility,
} from '../../../../shared/communication-hub/notice-records';

export interface NoticeListRow {
  id: string;
  unitId: string;
  source: 'officer' | 'automatic';
  automaticKind: AutomaticKind | null;
  title: string;
  titleAr: string | null;
  body: string | null;
  aboutDate: string | null;
  retiredAt: string | null;
  version: number;
  createdAt: string;
  postedByName: string | null;
}

export interface VoteRow {
  noticeId: string;
  question: string;
  closesOn: string;
  closesAt: string;
  eligibility: VoteEligibility;
  eligible: number;
  myOptionId: string | null;
}

export interface OptionRow {
  id: string;
  noticeId: string;
  label: string;
  count: number;
}

/** Brief 20 A1: the unit's notices, newest first — the retired ones too for those who manage them (D-155). */
export function noticeRowsQuery(unitId: string, withRetired: boolean) {
  return {
    sql: `SELECT n.id, n.unit_id AS unitId, n.source, n.automatic_kind AS automaticKind, n.title, n.title_ar AS titleAr, n.body,
         n.about_date AS aboutDate, n.retired_at AS retiredAt, n.version, n.created_at AS createdAt,
         CASE WHEN n.source = 'officer' THEN p.name END AS postedByName
       FROM notices n LEFT JOIN people p ON p.id = n.created_by
       WHERE n.unit_id = ? ${withRetired ? '' : 'AND n.retired_at IS NULL'}
       ORDER BY n.created_at DESC, n.id DESC`,
    binds: [unitId],
  };
}

/** The unit's votes, with whether this person may vote on each and what they chose. */
export async function listVoteRows(
  db: D1Database,
  unitId: string,
  personId: string,
): Promise<VoteRow[]> {
  const { results } = await db
    .prepare(
      `SELECT v.notice_id AS noticeId, v.question, v.closes_on AS closesOn, v.closes_at AS closesAt,
         v.eligibility,
         EXISTS (SELECT 1 FROM notice_vote_voters w WHERE w.notice_id = v.notice_id AND w.person_id = ?) AS eligible,
         (SELECT b.option_id FROM notice_ballots b WHERE b.notice_id = v.notice_id AND b.person_id = ?) AS myOptionId
       FROM notice_votes v JOIN notices n ON n.id = v.notice_id WHERE n.unit_id = ?`,
    )
    .bind(personId, personId, unitId)
    .all<VoteRow>();
  return results;
}

/** Every option of the unit's votes, in order, with its count — shown only once a vote closes (P12). */
export async function listOptionRows(db: D1Database, unitId: string): Promise<OptionRow[]> {
  const { results } = await db
    .prepare(
      `SELECT o.id, o.notice_id AS noticeId, o.label,
         (SELECT COUNT(*) FROM notice_ballots b WHERE b.option_id = o.id) AS count
       FROM notice_vote_options o JOIN notices n ON n.id = o.notice_id
       WHERE n.unit_id = ? ORDER BY o.notice_id, o.position`,
    )
    .bind(unitId)
    .all<OptionRow>();
  return results;
}

/** The chosen roles (P11) of the unit's votes, and — for those who manage — the named voters. */
export async function listVoterChoiceRows(
  db: D1Database,
  unitId: string,
  withNamed: boolean,
): Promise<{
  roles: { noticeId: string; id: string }[];
  named: { noticeId: string; id: string }[];
}> {
  const roles = await db
    .prepare(
      `SELECT r.notice_id AS noticeId, r.role_id AS id FROM notice_vote_roles r
       JOIN notices n ON n.id = r.notice_id WHERE n.unit_id = ?`,
    )
    .bind(unitId)
    .all<{ noticeId: string; id: string }>();
  if (!withNamed) return { roles: roles.results, named: [] };
  const named = await db
    .prepare(
      `SELECT w.notice_id AS noticeId, w.person_id AS id FROM notice_vote_voters w
       JOIN notice_votes v ON v.notice_id = w.notice_id AND v.eligibility = 'named'
       JOIN notices n ON n.id = w.notice_id WHERE n.unit_id = ?`,
    )
    .bind(unitId)
    .all<{ noticeId: string; id: string }>();
  return { roles: roles.results, named: named.results };
}
