import type { ProgressSummary } from './read-progress-summary.ts';

export type PhaseStage = 'complete' | 'current' | 'ahead';

export interface PhaseProgress {
  number: number;
  name: string;
  summary: ProgressSummary | null;
}

/** Complete once it has a completion date; in progress while it has a report. */
export function phaseStage(phase: PhaseProgress): PhaseStage {
  if (!phase.summary) return 'ahead';
  return phase.summary.completed ? 'complete' : 'current';
}

export const STAGE_LABELS: Record<PhaseStage, string> = {
  complete: 'Complete',
  current: 'In progress',
  ahead: 'Not started',
};
