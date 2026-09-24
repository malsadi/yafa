import type { Bilingual } from './bilingual.ts';
import { escapeHtml } from './escape-html.ts';
import { formatLongDate } from './format-long-date.ts';
import type { PageContext } from './page-context.ts';
import { phaseStage, type PhaseProgress } from './phase-stage.ts';
import type { CurrentWork } from './read-current-work.ts';
import type { ProgressSummary } from './read-progress-summary.ts';

function list(page: PageContext, key: string, items: Bilingual[], className: string): string {
  if (items.length === 0) return '';
  const rows = items.map((item) => `<li>${escapeHtml(item[page.language])}</li>`).join('');
  return `<div class="${className}"><h3>${page.t(key)}</h3><ul>${rows}</ul></div>`;
}

function dates(page: PageContext, s: ProgressSummary): string {
  const rows: [string, string][] = [['started', s.started]];
  if (s.completed) rows.push(['completed', s.completed]);
  rows.push(['lastUpdated', s.lastUpdated]);
  const items = rows
    .map(
      ([key, date]) =>
        `<div><dt>${page.t(key)}</dt><dd>${formatLongDate(date, page.language)}</dd></div>`,
    )
    .join('');
  return `<dl class="panel-dates">${items}</dl>`;
}

function body(page: PageContext, phase: PhaseProgress, now: CurrentWork): string {
  const s = phase.summary;
  if (!s) return `<p class="panel-summary">${page.t('notStarted')}</p>`;
  const nowLine =
    phaseStage(phase) === 'current'
      ? `<p class="panel-now"><span>${page.t('now')}</span> ${escapeHtml(now.now[page.language])}</p>`
      : '';
  return [
    `<p class="panel-summary">${escapeHtml(s.summary[page.language])}</p>`,
    dates(page, s),
    nowLine,
    list(
      page,
      'pending',
      s.pending.map((item) => item.text),
      'panel-pending',
    ),
    '<div class="panel-columns">',
    list(page, 'built', s.built, 'panel-built'),
    list(page, 'left', s.left, 'panel-left'),
    '</div>',
  ].join('');
}

/**
 * One phase's panel (D-058): a native popover, opened by its segment, closed
 * by clicking elsewhere, Escape or the close control — no script. With
 * JavaScript off, every panel is laid out in order instead.
 */
export function renderPhasePanel(
  page: PageContext,
  phase: PhaseProgress,
  now: CurrentWork,
): string {
  const number = String(phase.number);
  const stage = phaseStage(phase);
  return `<section id="phase-${number}" class="panel ${stage}" popover aria-labelledby="phase-${number}-title">
<header class="panel-head">
<p class="panel-kicker"><span class="panel-number">${page.t('phase', { number })}</span><span class="panel-status">${page.t(stage)}</span></p>
<h2 id="phase-${number}-title">${page.t(`phase.${number}`)}</h2>
<button type="button" class="panel-close" popovertarget="phase-${number}" popovertargetaction="hide">${page.t('close')}</button>
</header>
${body(page, phase, now)}
</section>`;
}
