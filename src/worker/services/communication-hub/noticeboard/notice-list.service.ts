import type {
  NoticeRecord,
  NoticeVoteView,
} from '../../../../shared/communication-hub/notice-records';
import { can, type RequestContext } from '../../../core/permissions';
import { requireHubCapability } from '../hub-access';
import {
  listNoticeRows,
  listOptionRows,
  listVoteRows,
  listVoterChoiceRows,
  type OptionRow,
  type VoteRow,
} from './notice-list.repo';
import { MANAGE, READ } from './noticeboard.service';

const idsOf = (rows: { noticeId: string; id: string }[], noticeId: string) =>
  rows.filter((row) => row.noticeId === noticeId).map((row) => row.id);

/**
 * P12 and D-156: a vote as this reader sees it — counts only, and only once
 * it has closed; whether they may vote (chosen, still open, not yet voted,
 * on a live notice in a unit that takes changes, P4).
 */
function voteView(
  vote: VoteRow,
  context: {
    options: OptionRow[];
    choices: {
      roles: { noticeId: string; id: string }[];
      named: { noticeId: string; id: string }[];
    };
    live: boolean;
    now: string;
  },
): NoticeVoteView {
  const options = context.options.filter((o) => o.noticeId === vote.noticeId);
  const closed = context.now >= vote.closesAt;
  return {
    question: vote.question,
    closesOn: vote.closesOn,
    closed,
    eligibility: vote.eligibility,
    roleIds: idsOf(context.choices.roles, vote.noticeId),
    namedPersonIds: idsOf(context.choices.named, vote.noticeId),
    options: options.map((o) => ({ id: o.id, label: o.label })),
    hasVotes: options.some((o) => o.count > 0),
    mayVote: Boolean(vote.eligible) && !closed && vote.myOptionId === null && context.live,
    myOptionId: vote.myOptionId,
    results: closed ? options.map((o) => ({ optionId: o.id, count: o.count })) : null,
  };
}

/** Brief 20 A1 and A2; D-154: the unit's Noticeboard, for its own officers. */
export async function listNotices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<NoticeRecord[]> {
  const unit = await requireHubCapability(db, ctx, READ, unitId);
  const manages = await can(db, ctx, MANAGE, { unitId });
  const writable = unit.type === 'national' || unit.status === 'active';
  const [rows, votes, options, choices] = await Promise.all([
    listNoticeRows(db, unitId, manages),
    listVoteRows(db, unitId, ctx.personId),
    listOptionRows(db, unitId),
    listVoterChoiceRows(db, unitId, manages),
  ]);
  const now = new Date().toISOString();
  return rows.map((row) => {
    const vote = votes.find((v) => v.noticeId === row.id);
    const live = row.retiredAt === null && writable;
    return { ...row, vote: vote ? voteView(vote, { options, choices, live, now }) : null };
  });
}
