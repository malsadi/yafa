import { escapeHtml } from './escape-html.ts';
import { phaseStage, type PhaseProgress, type PhaseStage } from './phase-stage.ts';

const STAGE_WORDS: Record<PhaseStage, string> = {
  complete: 'complete',
  current: 'in progress',
  ahead: 'not started',
};

/** The whole build as one bar: a segment per phase (D-045). */
export function renderProgressBar(phases: PhaseProgress[]): string {
  const complete = phases.filter((phase) => phaseStage(phase) === 'complete').length;
  const segments = phases
    .map((phase) => {
      const stage = phaseStage(phase);
      const label = `Phase ${String(phase.number)}: ${escapeHtml(phase.name)}, ${STAGE_WORDS[stage]}`;
      return `<li class="segment ${stage}" title="${label}"><span class="visually-hidden">${label}</span></li>`;
    })
    .join('');
  return `<p class="overall">${String(complete)} of ${String(phases.length)} phases complete</p>
<ol class="bar">${segments}</ol>
<p class="legend"><span class="key complete"></span>Complete <span class="key current"></span>In progress <span class="key ahead"></span>Not started</p>`;
}
