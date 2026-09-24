import { execFileSync } from 'node:child_process';

function git(args: string[], cwd: string): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

/** Non-merge commits in `base..head`, oldest first; just `head` if there is no base. */
export function commitsInRange(base: string | undefined, head: string, cwd: string): string[] {
  const noBase = !base || /^0+$/.test(base);
  const range = noBase ? ['-1', head] : [`${base}..${head}`];
  return git(['rev-list', '--no-merges', '--reverse', ...range], cwd)
    .split('\n')
    .filter(Boolean);
}

export function changedFiles(sha: string, cwd: string): string[] {
  return git(['diff-tree', '--no-commit-id', '--name-only', '-r', '--root', sha], cwd)
    .split('\n')
    .filter(Boolean);
}

/** A file's contents at a commit, or null if it did not exist there. */
export function fileAt(sha: string, file: string, cwd: string): string | null {
  try {
    return git(['show', `${sha}:${file}`], cwd);
  } catch {
    return null;
  }
}

export function subject(sha: string, cwd: string): string {
  return git(['log', '-1', '--format=%h %s', sha], cwd).trim();
}
