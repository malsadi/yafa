import type {
  NoticeRecord,
  VoteEligibility,
} from '../../../shared/communication-hub/notice-records';
import { unitHubPath } from './hub.api';

export interface VoteDraft {
  question: string;
  options: string[];
  closesOn: string;
  eligibility: VoteEligibility;
  roleIds: string[];
  personIds: string[];
}

export interface NoticeDraft {
  title: string;
  body: string;
  withVote: boolean;
  vote: VoteDraft;
}

/** A notice's form: blank for a new one (two empty options), or the notice as it stands. */
export function draftOf(notice?: NoticeRecord): NoticeDraft {
  const vote = notice?.vote;
  return {
    title: notice?.title ?? '',
    body: notice?.body ?? '',
    withVote: Boolean(vote),
    vote: {
      question: vote?.question ?? '',
      options: vote ? vote.options.map((o) => o.label) : ['', ''],
      closesOn: vote?.closesOn ?? '',
      eligibility: vote?.eligibility ?? 'unit',
      roleIds: vote?.roleIds ?? [],
      personIds: vote?.namedPersonIds ?? [],
    },
  };
}

/** P11: who can vote, as the portal takes it. */
function voteBody(vote: VoteDraft) {
  const { question, options, closesOn, eligibility } = vote;
  const chosen =
    eligibility === 'roles'
      ? { kind: eligibility, roleIds: vote.roleIds }
      : eligibility === 'named'
        ? { kind: eligibility, personIds: vote.personIds }
        : { kind: eligibility };
  return { question, options, closesOn, eligibility: chosen };
}

/**
 * Brief 20 A1, A2 and D-155: the request the form makes — a new notice, or a
 * change from the version read. Once anyone has voted, the vote is left out
 * and stays as it is.
 */
export function saveRequest(unitId: string, draft: NoticeDraft, notice?: NoticeRecord) {
  const vote = draft.withVote ? voteBody(draft.vote) : null;
  const base = `${unitHubPath(unitId)}/notices`;
  if (!notice) {
    return {
      path: base,
      method: 'POST' as const,
      body: { title: draft.title, body: draft.body, vote },
    };
  }
  const locked = notice.vote?.hasVotes === true;
  return {
    path: `${base}/${notice.id}`,
    method: 'PUT' as const,
    body: {
      version: notice.version,
      notice: { title: draft.title, body: draft.body, ...(locked ? {} : { vote }) },
    },
  };
}
