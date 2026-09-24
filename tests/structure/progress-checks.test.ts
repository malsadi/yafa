import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { findStaleLivePages } from '../../scripts/progress-checks/check-live-page.ts';
import { findStaleNowLines } from '../../scripts/progress-checks/check-now-lines.ts';
import { findCodeWithoutSummary } from '../../scripts/progress-checks/check-summary-moves.ts';

// D-060: each check is run against a real, throwaway git repository.
function repo(): { dir: string; commit: (files: Record<string, string>) => string } {
  const dir = mkdtempSync(path.join(tmpdir(), 'progress-checks-'));
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.email=t@example.org', '-c', 'user.name=Test', ...args], {
      cwd: dir,
      encoding: 'utf8',
    }).trim();
  git('init', '-q');
  return {
    dir,
    commit: (files) => {
      for (const [file, content] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
        writeFileSync(path.join(dir, file), content);
      }
      git('add', '-A');
      git('commit', '-q', '-m', 'test commit', '--no-verify');
      return git('rev-parse', 'HEAD');
    },
  };
}

const now = (en: string, ar: string) =>
  `<!-- current-work:start -->\nUpdated: 2026-09-24 10:00\nNow: ${en}\nNow (ar): ${ar}\n<!-- current-work:end -->\n`;
const report = (built: string) =>
  `<!-- progress:start -->\nSummary: S || ع\nStarted: 2026-09-24\nLast updated: 2026-09-24\n\nBuilt:\n- ${built} || م\n<!-- progress:end -->\n`;
const CLAUDE = '**Current phase:** Phase 1 — Fixture\n';

describe('progress record checks (D-060)', () => {
  it('finds a commit that did not change both Now lines', () => {
    const { dir, commit } = repo();
    const base = commit({ 'docs/current-work.md': now('One', 'واحد') });
    commit({ 'docs/current-work.md': now('Two', 'اثنان') });
    const head = commit({ 'docs/current-work.md': now('Three', 'اثنان') });

    expect(findStaleNowLines(base, head, dir)).toEqual([
      expect.stringContaining('the "Now (ar):" line did not change'),
    ]);
  });

  it('finds a commit that changed code without moving the phase summary', () => {
    const { dir, commit } = repo();
    const base = commit({ 'CLAUDE.md': CLAUDE, 'docs/phase-reports/phase-01.md': report('A') });
    commit({ 'src/a.ts': 'one', 'docs/phase-reports/phase-01.md': report('B') });
    commit({ 'docs/notes.md': 'docs only' });
    const head = commit({ 'src/a.ts': 'two' });

    const failures = findCodeWithoutSummary(base, head, dir);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('changes code but not the Built, Left or Pending lists');
  });

  describe('live page', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('reports each live page that differs from this commit, with both timestamps', async () => {
      const { dir, commit } = repo();
      commit({
        'public/progress.html': '<time datetime="2026-09-24T21:00">',
        'public/progress.ar.html': '<time datetime="2026-09-24T21:00">',
      });
      vi.stubGlobal('fetch', (url: string) =>
        Promise.resolve(
          new Response(
            url.includes('.ar.')
              ? '<time datetime="2026-09-24T21:00">'
              : '<time datetime="2026-09-24T20:00">',
          ),
        ),
      );

      expect(
        await findStaleLivePages('https://preview.example', dir, { attempts: 2, waitMs: 1 }),
      ).toEqual([
        '/progress.html: live shows 2026-09-24T20:00, this commit built 2026-09-24T21:00',
      ]);
    });
  });
});
