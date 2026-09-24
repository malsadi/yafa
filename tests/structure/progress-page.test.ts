import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildProgressPage,
  PROGRESS_PAGE_FILE,
} from '../../scripts/progress-page/generate-progress-page.ts';
import { readProgressSummary } from '../../scripts/progress-page/read-progress-summary.ts';

const ROOT = path.join(import.meta.dirname, '../..');
const committed = readFileSync(path.join(ROOT, PROGRESS_PAGE_FILE), 'utf8');

// D-040: the page is public, so it holds build progress only. These words
// point at topics the owner excluded; a summary using one fails here.
const EXCLUDED_WORDS = [
  'permission',
  'capabilit',
  'security',
  'secret',
  'token',
  'password',
  'officer',
  'clerk',
  'admin',
  'database',
];

describe('public progress page (D-040)', () => {
  it('is up to date with docs/ — run `npm run progress-page` in the same commit', () => {
    expect(committed).toBe(buildProgressPage(ROOT));
  });

  it('asks search engines not to list it, and loads nothing from anywhere', () => {
    expect(committed).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(committed).not.toMatch(/<script|https?:\/\/|<link /i);
  });

  it('keeps every summary to build progress only', () => {
    const reports = readdirSync(path.join(ROOT, 'docs/phase-reports'));
    for (const file of reports) {
      const report = readFileSync(path.join(ROOT, 'docs/phase-reports', file), 'utf8');
      const text = JSON.stringify(readProgressSummary(report)).toLowerCase();
      for (const word of EXCLUDED_WORDS) {
        expect(text, `${file}: ${word}`).not.toContain(word);
      }
    }
  });
});
