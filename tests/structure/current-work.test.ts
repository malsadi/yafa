import { accessSync, constants, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readCurrentWork } from '../../scripts/progress-page/read-current-work.ts';

const ROOT = path.join(import.meta.dirname, '../..');

// D-057: the page shows what is being built now, stamped per commit.
describe('current work (D-057)', () => {
  it('has a valid Now line and time, in public wording', () => {
    const work = readCurrentWork(readFileSync(path.join(ROOT, 'docs/current-work.md'), 'utf8'));

    expect(work.now).not.toMatch(/\b[OPTD]-?\d|\b(you|your|owner)\b/i);
    for (const word of ['permission', 'capabilit', 'security', 'secret', 'token', 'officer']) {
      expect(work.now.toLowerCase(), word).not.toContain(word);
    }
  });

  it('is enforced by an executable pre-commit hook that npm install turns on', () => {
    const hook = path.join(ROOT, '.githooks/pre-commit');
    const scripts = (
      JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
        scripts: Record<string, string>;
      }
    ).scripts;

    expect(() => {
      accessSync(hook, constants.X_OK);
    }).not.toThrow();
    expect(readFileSync(hook, 'utf8')).toContain('Now: ');
    expect(scripts.prepare).toBe('git config core.hooksPath .githooks');
  });
});
