import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readOpenQuestionIds, readPhaseNames, readPortalName } from './read-phase-names.ts';
import { readCurrentWork } from './read-current-work.ts';
import { readProgressSummary } from './read-progress-summary.ts';
import type { PhaseProgress } from './phase-stage.ts';
import { renderProgressPage } from './render-progress-page.ts';

export const PROGRESS_PAGE_FILE = 'public/progress.html';

/**
 * Builds the public progress page (D-040, D-056) from the brief's title and
 * phase list, each phase report's progress summary, `docs/current-work.md`
 * (D-057) and `docs/decisions.md`.
 * Throws if the open questions referenced by pending items and the "Open"
 * table disagree, so the page can never drift from the decision log.
 */
export function buildProgressPage(root: string): string {
  const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
  const brief = read('system build prompt.md');
  const phases: PhaseProgress[] = readPhaseNames(brief).map((phase) => {
    const report = `docs/phase-reports/phase-${String(phase.number).padStart(2, '0')}.md`;
    const summary = existsSync(path.join(root, report)) ? readProgressSummary(read(report)) : null;
    return { ...phase, summary };
  });

  const listed = phases
    .flatMap((phase) => phase.summary?.pending ?? [])
    .flatMap((item) => (item.reference?.startsWith('O-') ? [item.reference] : []));
  const open = readOpenQuestionIds(read('docs/decisions.md'));
  if ([...listed].sort().join() !== [...open].sort().join()) {
    throw new Error(
      `Open questions differ: summaries [${listed.join()}], decisions.md [${open.join()}]`,
    );
  }

  return renderProgressPage(
    readPortalName(brief),
    phases,
    readCurrentWork(read('docs/current-work.md')),
  );
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const root = path.join(import.meta.dirname, '../..');
  writeFileSync(path.join(root, PROGRESS_PAGE_FILE), buildProgressPage(root));
}
