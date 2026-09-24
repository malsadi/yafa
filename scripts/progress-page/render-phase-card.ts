import { escapeHtml } from './escape-html.ts';
import { formatLongDate } from './format-long-date.ts';
import { phaseStage, STAGE_LABELS, type PhaseProgress } from './phase-stage.ts';
import type { ProgressSummary } from './read-progress-summary.ts';

function list(title: string, items: string[], className: string): string {
  if (items.length === 0) return '';
  const rows = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<div class="${className}"><h3>${title}</h3><ul>${rows}</ul></div>`;
}

function dates(s: ProgressSummary): string {
  const rows: [string, string][] = [['Started', s.started]];
  if (s.completed) rows.push(['Completed', s.completed]);
  rows.push(['Last updated', s.lastUpdated]);
  const items = rows
    .map(([label, date]) => `<div><dt>${label}</dt><dd>${formatLongDate(date)}</dd></div>`)
    .join('');
  return `<dl class="dates">${items}</dl>`;
}

function detail(phase: PhaseProgress): string {
  const s = phase.summary;
  if (!s) {
    return '<div class="detail"><p class="quiet">Work on this phase has not started yet.</p></div>';
  }
  return [
    '<div class="detail">',
    dates(s),
    list(
      'Pending',
      s.pending.map((item) => item.text),
      'pending-list',
    ),
    '<div class="columns">',
    list('Completed so far', s.built, 'built'),
    list('Still to do', s.left, 'left'),
    '</div></div>',
  ].join('');
}

function pendingMarker(count: number): string {
  if (count === 0) return '';
  return `<span class="pending">${String(count)} ${count === 1 ? 'item' : 'items'} pending</span>`;
}

/**
 * One phase as a card (D-045, D-056): a native `<details>`, so it opens and
 * closes with no script; the phase in progress starts open. Pending items
 * are counted on the card itself.
 */
export function renderPhaseCard(phase: PhaseProgress): string {
  const stage = phaseStage(phase);
  const line = phase.summary?.summary ?? '';
  return [
    `<details class="card ${stage}"${stage === 'current' ? ' open' : ''}>`,
    '<summary>',
    `<span class="card-number" aria-hidden="true">${String(phase.number)}</span>`,
    '<span class="card-body">',
    `<span class="card-title"><span class="visually-hidden">Phase ${String(phase.number)}: </span>${escapeHtml(phase.name)}</span>`,
    line ? `<span class="card-summary">${escapeHtml(line)}</span>` : '',
    `<span class="card-meta"><span class="status ${stage}">${STAGE_LABELS[stage]}</span>`,
    pendingMarker(phase.summary?.pending.length ?? 0),
    '</span></span>',
    '</summary>',
    detail(phase),
    '</details>',
  ].join('');
}
