import type { PageContext } from './page-context.ts';
import { phaseStage, type PhaseProgress } from './phase-stage.ts';

function renderSegment(page: PageContext, phase: PhaseProgress): string {
  const stage = phaseStage(phase);
  const number = String(phase.number);
  const name = page.t(`phase.${number}`);
  const status = page.t(stage);
  return `<li class="segment ${stage}">
<button type="button" popovertarget="phase-${number}" aria-label="${page.t('phase', { number })}: ${name}, ${status}">
<span class="seg-number" aria-hidden="true">${number}</span>
<span class="seg-cloth" aria-hidden="true"></span>
<span class="seg-words" aria-hidden="true"><span class="seg-name">${name}</span><span class="seg-status">${status}</span></span>
</button>
</li>`;
}

/**
 * The one bar (D-058): a segment per phase, each a button that opens its
 * phase's panel. Complete phases are stitched through, the phase in
 * progress part-stitched, phases ahead only tacked in outline.
 */
export function renderProgressBar(page: PageContext, phases: PhaseProgress[]): string {
  const complete = phases.filter((phase) => phaseStage(phase) === 'complete').length;
  const [before = '', after = ''] = page.t('tally', { total: phases.length }).split('{complete}');
  return `<section class="progress" aria-label="${page.t('barLabel')}">
<p class="tally">${before}<span class="tally-figure">${String(complete)}</span>${after}</p>
<ul class="legend">
<li><span class="key complete" aria-hidden="true"></span>${page.t('complete')}</li>
<li><span class="key current" aria-hidden="true"></span>${page.t('current')}</li>
<li><span class="key ahead" aria-hidden="true"></span>${page.t('ahead')}</li>
</ul>
<ol class="bar">
${phases.map((phase) => renderSegment(page, phase)).join('\n')}
</ol>
</section>`;
}
