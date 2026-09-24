import { readCurrentWork, type CurrentWork } from '../progress-page/read-current-work.ts';
import { commitsInRange, fileAt, subject } from './git-history.ts';

const FILE = 'docs/current-work.md';

function readAt(sha: string, cwd: string): CurrentWork | null {
  const file = fileAt(sha, FILE, cwd);
  return file ? readCurrentWork(file) : null;
}

/**
 * D-060, check 1: every commit changes both "Now" lines in
 * docs/current-work.md — the server-side twin of the pre-commit hook, so a
 * bypassed hook or a commit made elsewhere is still caught. Returns the
 * commits that fail, with why.
 */
export function findStaleNowLines(base: string | undefined, head: string, cwd: string): string[] {
  const failures: string[] = [];
  for (const sha of commitsInRange(base, head, cwd)) {
    const after = readAt(sha, cwd);
    const before = readAt(`${sha}^`, cwd);
    if (!after) {
      failures.push(`${subject(sha, cwd)}: ${FILE} is missing`);
    } else if (after.now.en === before?.now.en) {
      failures.push(`${subject(sha, cwd)}: the "Now:" line did not change`);
    } else if (after.now.ar === before?.now.ar) {
      failures.push(`${subject(sha, cwd)}: the "Now (ar):" line did not change`);
    }
  }
  return failures;
}

if (import.meta.url === `file://${process.argv[1] ?? ''}`) {
  const [base, head = 'HEAD'] = process.argv.slice(2);
  const failures = findStaleNowLines(base, head, process.cwd());
  for (const failure of failures) console.error(`✗ ${failure}`);
  if (failures.length > 0) process.exit(1);
  console.log('✓ every commit changed both "Now" lines');
}
