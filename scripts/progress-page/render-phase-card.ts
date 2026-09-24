import { escapeHtml } from './escape-html.ts';
import { phaseStage, waitingCount, type PhaseProgress } from './phase-stage.ts';

function list(title: string, items: string[]): string {
  if (items.length === 0) return '';
  const rows = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<h3>${title}</h3><ul>${rows}</ul>`;
}

function dates(phase: PhaseProgress): string {
  const s = phase.summary;
  if (!s) return '<p>Not started yet.</p>';
  const parts = [`Started ${s.started}`];
  if (s.approved) parts.push(`approved ${s.approved}`);
  parts.push(`last updated ${s.lastUpdated}`);
  return `<p class="dates">${escapeHtml(parts.join(' · '))}</p>`;
}

function detail(phase: PhaseProgress): string {
  const s = phase.summary;
  const waiting = s
    ? list('Waiting on you', [...s.waitingOnOwner, ...s.openQuestions, ...s.proposals])
    : '';
  return [
    '<div class="detail">',
    dates(phase),
    waiting,
    s ? list('Built', s.done) : '',
    s ? list('Left', s.left) : '',
    '</div>',
  ].join('');
}

/**
 * One phase as a card (D-045): a native `<details>`, so it opens and closes
 * with no script; the phase in progress starts open. Anything waiting on
 * the owner is counted on the card itself.
 */
export function renderPhaseCard(phase: PhaseProgress): string {
  const stage = phaseStage(phase);
  const waiting = waitingCount(phase.summary);
  const status = phase.summary?.status ?? 'Not started';
  const line = phase.summary?.summary ?? '';
  return [
    `<details class="card ${stage}"${stage === 'current' ? ' open' : ''}>`,
    '<summary>',
    `<span class="title">Phase ${String(phase.number)}: ${escapeHtml(phase.name)}</span>`,
    `<span class="badges"><span class="status ${stage}">${escapeHtml(status)}</span>`,
    waiting > 0 ? `<span class="waiting">Waiting on you: ${String(waiting)}</span>` : '',
    '</span>',
    line ? `<span class="line">${escapeHtml(line)}</span>` : '',
    '</summary>',
    detail(phase),
    '</details>',
  ].join('');
}
