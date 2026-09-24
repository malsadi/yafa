import { escapeHtml } from './escape-html.ts';
import { formatLongDateTime } from './format-long-date.ts';
import type { PhaseProgress } from './phase-stage.ts';
import type { CurrentWork } from './read-current-work.ts';
import { NO_SCRIPT_STYLE, PROGRESS_PAGE_STYLE } from './progress-page-style.ts';
import { renderPhaseCard } from './render-phase-card.ts';
import { renderProgressBar } from './render-progress-bar.ts';

/**
 * The public build progress page (D-040, D-045, D-056): one self-contained
 * file with no scripts, no outside fonts or images, and not indexed. The
 * portal's name comes from the brief's title; everything else from docs/.
 */
export function renderProgressPage(
  portalName: string,
  phases: PhaseProgress[],
  currentWork: CurrentWork,
): string {
  const name = escapeHtml(portalName);
  const updated = formatLongDateTime(currentWork.updated);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>Build progress · ${name}</title>
<style>${PROGRESS_PAGE_STYLE}</style>
<noscript><style>${NO_SCRIPT_STYLE}</style></noscript>
</head>
<body>
<main>
<header class="masthead">
<p class="eyebrow">Build progress</p>
<h1>${name}</h1>
<p class="lede">The ${name} is being built in ${String(phases.length)} phases. This page shows how the work is going.</p>
<p class="portal-link"><a href="/portal">Go to the portal</a> <span>Access is by invitation only.</span></p>
<p class="stamp">Last updated <time datetime="${currentWork.updated.replace(' ', 'T')}">${updated}</time></p>
</header>
<section class="now" aria-label="Now">
<h2>Now</h2>
<p>${escapeHtml(currentWork.now)}</p>
</section>
${renderProgressBar(phases)}
<section class="phases" aria-label="Phases">
<h2>The phases</h2>
${phases.map(renderPhaseCard).join('\n')}
</section>
<footer><p>Last updated ${updated}</p></footer>
</main>
</body>
</html>
`;
}
