import type { PageLanguage } from './bilingual.ts';
import { formatLongDate } from './format-long-date.ts';
import { escapeHtml } from './escape-html.ts';
import type { PageContext } from './page-context.ts';
import type { PhaseProgress } from './phase-stage.ts';
import { NO_SCRIPT_STYLE, PROGRESS_PAGE_STYLE } from './progress-page-style.ts';
import type { CurrentWork } from './read-current-work.ts';
import { renderPhasePanel } from './render-phase-panel.ts';
import { renderProgressBar } from './render-progress-bar.ts';

export const PROGRESS_PAGE_PATHS: Record<PageLanguage, string> = {
  en: '/progress.html',
  ar: '/progress.ar.html',
};

function masthead(page: PageContext, phases: PhaseProgress[], now: CurrentWork): string {
  const other: PageLanguage = page.language === 'en' ? 'ar' : 'en';
  const [date = '', time = ''] = now.updated.split(' ');
  return `<header class="masthead">
<div class="topline">
<p class="eyebrow">${page.t('eyebrow')}</p>
<a class="language" href="${PROGRESS_PAGE_PATHS[other]}" lang="${other}" hreflang="${other}">${page.t('otherLanguage')}</a>
</div>
<h1>${page.t('portalName')}</h1>
<p class="lede">${page.t('lede', { portal: page.t('portalName'), count: phases.length })}</p>
<div class="meta">
<p class="now"><span class="now-label">${page.t('now')}</span><span class="now-text">${escapeHtml(now.now[page.language])}</span></p>
<p class="stamp"><time datetime="${now.updated.replace(' ', 'T')}">${page.t('updated', { date: formatLongDate(date, page.language), time })}</time></p>
</div>
<p class="portal-link"><a href="/portal">${page.t('portalLink')}</a> <span>${page.t('invitation')}</span></p>
</header>`;
}

/**
 * The public build progress page in one language (D-040, D-056, D-057,
 * D-058): one self-contained file, no scripts, no outside fonts or images,
 * not indexed, mirrored right to left in Arabic.
 */
export function renderProgressPage(
  page: PageContext,
  phases: PhaseProgress[],
  now: CurrentWork,
): string {
  const dir = page.language === 'ar' ? 'rtl' : 'ltr';
  return `<!doctype html>
<html lang="${page.language}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>${page.t('eyebrow')} · ${page.t('portalName')}</title>
<style>${PROGRESS_PAGE_STYLE}</style>
<noscript><style>${NO_SCRIPT_STYLE}</style></noscript>
</head>
<body>
<main class="page">
${masthead(page, phases, now)}
${renderProgressBar(page, phases)}
<div class="panels">
${phases.map((phase) => renderPhasePanel(page, phase, now)).join('\n')}
</div>
</main>
</body>
</html>
`;
}
