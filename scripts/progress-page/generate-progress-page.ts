import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { PageLanguage } from './bilingual.ts';
import { createPageContext } from './page-context.ts';
import type { PhaseProgress } from './phase-stage.ts';
import { readCurrentWork } from './read-current-work.ts';
import { readOpenQuestionIds, readPhaseNames, readPortalName } from './read-phase-names.ts';
import { readProgressSummary } from './read-progress-summary.ts';
import { entry, readProgressText, type ProgressText } from './read-progress-text.ts';
import { PROGRESS_PAGE_PATHS, renderProgressPage } from './render-progress-page.ts';

export const PROGRESS_PAGE_FILES: Record<PageLanguage, string> = {
  en: `public${PROGRESS_PAGE_PATHS.en}`,
  ar: `public${PROGRESS_PAGE_PATHS.ar}`,
};

/** The English names on the page are the brief's own, exactly. */
function checkAgainstBrief(text: ProgressText, brief: string): void {
  if (entry(text, 'portalName').en !== readPortalName(brief)) {
    throw new Error('portalName in docs/progress-page-text.md differs from the brief title');
  }
  for (const phase of readPhaseNames(brief)) {
    if (entry(text, `phase.${String(phase.number)}`).en !== phase.name) {
      throw new Error(`phase.${String(phase.number)} differs from the brief: ${phase.name}`);
    }
  }
}

function checkOpenQuestions(phases: PhaseProgress[], decisions: string): void {
  const listed = phases
    .flatMap((phase) => phase.summary?.pending ?? [])
    .flatMap((item) => (item.reference?.startsWith('O-') ? [item.reference] : []));
  const open = readOpenQuestionIds(decisions);
  if ([...listed].sort().join() !== [...open].sort().join()) {
    throw new Error(
      `Open questions differ: summaries [${listed.join()}], decisions.md [${open.join()}]`,
    );
  }
}

/**
 * Builds the public progress page in English and Arabic (D-040, D-056,
 * D-057, D-058) from the brief's phase list, each phase report's summary,
 * `docs/current-work.md`, `docs/progress-page-text.md` and
 * `docs/decisions.md`. Refuses to build if any of them disagree.
 */
export function buildProgressPages(root: string): Record<PageLanguage, string> {
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  const brief = read('system build prompt.md');
  const text = readProgressText(read('docs/progress-page-text.md'));
  checkAgainstBrief(text, brief);
  const phases: PhaseProgress[] = readPhaseNames(brief).map((phase) => {
    const report = `docs/phase-reports/phase-${String(phase.number).padStart(2, '0')}.md`;
    const summary = existsSync(path.join(root, report)) ? readProgressSummary(read(report)) : null;
    return { number: phase.number, summary };
  });
  checkOpenQuestions(phases, read('docs/decisions.md'));
  const now = readCurrentWork(read('docs/current-work.md'));
  const build = (language: PageLanguage) =>
    renderProgressPage(createPageContext(language, text), phases, now);
  return { en: build('en'), ar: build('ar') };
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const root = path.join(import.meta.dirname, '../..');
  const pages = buildProgressPages(root);
  for (const language of ['en', 'ar'] as const) {
    writeFileSync(path.join(root, PROGRESS_PAGE_FILES[language]), pages[language]);
  }
}
