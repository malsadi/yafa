import type { ProgressSummary } from './read-progress-summary.ts';

export type PhaseStage = 'complete' | 'current' | 'ahead';

export interface PhaseProgress {
  number: number;
  name: string;
  summary: ProgressSummary | null;
}

/** Complete once approved; in progress while it has a report; else ahead. */
export function phaseStage(phase: PhaseProgress): PhaseStage {
  if (!phase.summary) return 'ahead';
  return phase.summary.approved ? 'complete' : 'current';
}

/** Everything on a phase that waits on the owner, counted for its card. */
export function waitingCount(summary: ProgressSummary | null): number {
  if (!summary) return 0;
  return summary.waitingOnOwner.length + summary.openQuestions.length + summary.proposals.length;
}
