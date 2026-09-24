import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readOpenQuestionIds, readPhaseNames } from './read-phase-names.ts';
import { readProgressSummary } from './read-progress-summary.ts';
import { renderProgressPage, type PhaseProgress } from './render-progress-page.ts';

export const PROGRESS_PAGE_FILE = 'public/progress.html';

/**
 * Builds the public progress page (D-040) from the brief's phase list, each
 * phase report's progress summary, and `docs/decisions.md`. Throws if the
 * open questions listed in the summaries and the "Open" table disagree, so
 * the page can never drift from the decision log.
 */
export function buildProgressPage(root: string): string {
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  const phases: PhaseProgress[] = readPhaseNames(read('system build prompt.md')).map((phase) => {
    const report = `docs/phase-reports/phase-${String(phase.number).padStart(2, '0')}.md`;
    const summary = existsSync(path.join(root, report)) ? readProgressSummary(read(report)) : null;
    return { ...phase, summary };
  });

  const listed = phases
    .flatMap((phase) => phase.summary?.openQuestions ?? [])
    .map((question) => /^(O-\d+)/.exec(question)?.[1] ?? question);
  const open = readOpenQuestionIds(read('docs/decisions.md'));
  if ([...listed].sort().join() !== [...open].sort().join()) {
    throw new Error(
      `Open questions differ: summaries [${listed.join()}], decisions.md [${open.join()}]`,
    );
  }

  const dates = phases.flatMap((phase) => (phase.summary ? [phase.summary.lastUpdated] : []));
  return renderProgressPage(phases, dates.sort().at(-1) ?? 'never');
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const root = path.join(import.meta.dirname, '../..');
  writeFileSync(path.join(root, PROGRESS_PAGE_FILE), buildProgressPage(root));
}
