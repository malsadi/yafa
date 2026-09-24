import { escapeHtml } from './escape-html.ts';
import type { PhaseProgress } from './phase-stage.ts';
import { NO_SCRIPT_STYLE, PROGRESS_PAGE_STYLE } from './progress-page-style.ts';
import { renderPhaseCard } from './render-phase-card.ts';
import { renderProgressBar } from './render-progress-bar.ts';

/**
 * One self-contained page (D-040, D-045): no scripts, no outside fonts or
 * images, not indexed. The bar shows the whole build at a glance; each
 * phase is a card that opens to its detail.
 */
export function renderProgressPage(phases: PhaseProgress[], lastUpdated: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>Build progress</title>
<style>${PROGRESS_PAGE_STYLE}</style>
<noscript><style>${NO_SCRIPT_STYLE}</style></noscript>
</head>
<body>
<h1>Build progress</h1>
<p class="portal"><a href="/portal">Go to the portal</a>. Access is by invitation only.</p>
<p class="updated">Last updated ${escapeHtml(lastUpdated)}. Generated from the project's decision log and phase reports.</p>
${renderProgressBar(phases)}
<div class="cards">
${phases.map(renderPhaseCard).join('\n')}
</div>
</body>
</html>
`;
}
