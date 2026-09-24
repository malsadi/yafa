import { escapeHtml } from './escape-html.ts';
import { phaseStage, STAGE_LABELS, type PhaseProgress } from './phase-stage.ts';

/** The whole build as one numbered bar, a segment per phase (D-045, D-056). */
export function renderProgressBar(phases: PhaseProgress[]): string {
  const complete = phases.filter((phase) => phaseStage(phase) === 'complete').length;
  const segments = phases
    .map((phase) => {
      const stage = phaseStage(phase);
      const label = `Phase ${String(phase.number)}, ${escapeHtml(phase.name)}: ${STAGE_LABELS[stage].toLowerCase()}`;
      return `<li class="segment ${stage}"><span class="segment-fill"></span><span class="segment-number" aria-hidden="true">${String(phase.number)}</span><span class="visually-hidden">${label}</span></li>`;
    })
    .join('');
  return `<section class="overview" aria-label="Overall progress">
<p class="tally"><span class="tally-figure">${String(complete)}</span><span class="tally-words">of ${String(phases.length)} phases complete</span></p>
<ol class="bar">${segments}</ol>
<ul class="legend"><li><span class="key complete"></span>Complete</li><li><span class="key current"></span>In progress</li><li><span class="key ahead"></span>Not started</li></ul>
</section>`;
}
