import {
  readProgressSummary,
  type ProgressSummary,
} from '../progress-page/read-progress-summary.ts';
import { changedFiles, commitsInRange, fileAt, subject } from './git-history.ts';

const CODE = /^(src|migrations)\//;

function currentPhaseReport(sha: string, cwd: string): string | null {
  const claude = fileAt(sha, 'CLAUDE.md', cwd) ?? '';
  const phase = /^\*\*Current phase:\*\* Phase (\d+)/m.exec(claude)?.[1];
  return phase ? `docs/phase-reports/phase-${phase.padStart(2, '0')}.md` : null;
}

function progressLists(report: string | null): string {
  const summary: ProgressSummary | null = report ? readProgressSummary(report) : null;
  return summary ? JSON.stringify([summary.built, summary.left, summary.pending]) : '';
}

/**
 * D-060, check 2: a commit that changes code (`src/`, `migrations/`) also
 * changes the current phase's public summary — its Built, Left or Pending
 * lists — so the record can never fall behind the work unnoticed.
 */
export function findCodeWithoutSummary(
  base: string | undefined,
  head: string,
  cwd: string,
): string[] {
  const failures: string[] = [];
  for (const sha of commitsInRange(base, head, cwd)) {
    if (!changedFiles(sha, cwd).some((file) => CODE.test(file))) continue;
    const report = currentPhaseReport(sha, cwd);
    if (!report) {
      failures.push(`${subject(sha, cwd)}: CLAUDE.md names no current phase`);
      continue;
    }
    const before = progressLists(fileAt(`${sha}^`, report, cwd));
    const after = progressLists(fileAt(sha, report, cwd));
    if (!after || before === after) {
      failures.push(
        `${subject(sha, cwd)}: changes code but not the Built, Left or Pending lists in ${report}`,
      );
    }
  }
  return failures;
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const [base, head = 'HEAD'] = process.argv.slice(2);
  const failures = findCodeWithoutSummary(base, head, process.cwd());
  for (const failure of failures) console.error(`✗ ${failure}`);
  if (failures.length > 0) process.exit(1);
  console.log('✓ every commit that changed code also moved the phase summary');
}
