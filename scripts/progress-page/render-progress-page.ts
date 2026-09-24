import type { ProgressSummary } from './read-progress-summary.ts';

export interface PhaseProgress {
  number: number;
  name: string;
  summary: ProgressSummary | null;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function list(title: string, items: string[]): string {
  if (items.length === 0) return '';
  const rows = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<h3>${title}</h3><ul>${rows}</ul>`;
}

function phaseSection(phase: PhaseProgress): string {
  const heading = `<h2>Phase ${String(phase.number)}: ${escapeHtml(phase.name)}</h2>`;
  if (!phase.summary) {
    return `<section>${heading}<p class="status">Not started</p></section>`;
  }
  const s = phase.summary;
  return [
    `<section>${heading}`,
    `<p class="status">${escapeHtml(s.status)} · updated ${escapeHtml(s.lastUpdated)}</p>`,
    list('Done', s.done),
    list('Left', s.left),
    list('Open questions', s.openQuestions),
    list('Proposals awaiting confirmation', s.proposals),
    '</section>',
  ].join('');
}

const STYLE = `body{font-family:system-ui,sans-serif;line-height:1.5;margin:0 auto;max-width:44rem;padding:1rem;color:#1a1a1a;background:#fff}
h1{font-size:1.5rem}h2{font-size:1.15rem;margin-block-start:2rem;border-block-end:1px solid #ddd}
h3{font-size:1rem;margin-block-end:.25rem}ul{padding-inline-start:1.25rem;margin-block-start:.25rem}
.status{font-weight:600}`;

/** One self-contained page: no scripts, no outside resources, not indexed. */
export function renderProgressPage(phases: PhaseProgress[], lastUpdated: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Build progress</title>
<style>${STYLE}</style>
</head>
<body>
<h1>Build progress</h1>
<p>Last updated ${escapeHtml(lastUpdated)}. Generated from the project's decision log and phase reports.</p>
${phases.map(phaseSection).join('\n')}
</body>
</html>
`;
}
