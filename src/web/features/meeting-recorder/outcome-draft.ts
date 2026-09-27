import type { AgendaItemRecord } from '../../../shared/meeting-recorder/meeting-records';

/** Brief 22 B2 and D-206: an item's vote or decision, as typed. */
export interface OutcomeDraft {
  kind: 'vote' | 'decision';
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  voteResult: string;
  decision: string;
}

export function outcomeDraftOf(item: AgendaItemRecord): OutcomeDraft {
  return {
    kind: item.outcomeKind ?? 'decision',
    votesFor: item.votesFor === null ? '' : String(item.votesFor),
    votesAgainst: item.votesAgainst === null ? '' : String(item.votesAgainst),
    votesAbstain: item.votesAbstain === null ? '' : String(item.votesAbstain),
    voteResult: item.voteResult ?? '',
    decision: item.decision ?? '',
  };
}

const whole = (text: string) => (/^\d+$/.test(text.trim()) ? Number(text) : null);

/** The outcome as the portal takes it; null when a number doesn't read as a whole number. */
export function outcomeBodyOf(draft: OutcomeDraft) {
  if (draft.kind === 'decision') return { kind: 'decision' as const, decision: draft.decision };
  const [votesFor, votesAgainst, votesAbstain] = [
    whole(draft.votesFor),
    whole(draft.votesAgainst),
    whole(draft.votesAbstain),
  ];
  if (votesFor === null || votesAgainst === null || votesAbstain === null) return null;
  return {
    kind: 'vote' as const,
    votesFor,
    votesAgainst,
    votesAbstain,
    voteResult: draft.voteResult,
  };
}
