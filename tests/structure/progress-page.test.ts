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

  it('opens exactly the card of the phase in progress, and every card with JavaScript off', () => {
    const cards = [...committed.matchAll(/<details class="card (\w+)"( open)?>/g)];

    expect(cards.length).toBeGreaterThan(1);
    for (const [, stage, open] of cards) {
      expect(Boolean(open), stage).toBe(stage === 'current');
    }
    expect(committed).toMatch(/<noscript><style>details\.card::details-content\{[^}]*visible/);
  });

  it('keeps every summary to build progress only, in plain public words (D-056)', () => {
    const reports = readdirSync(path.join(ROOT, 'docs/phase-reports'));
    for (const file of reports) {
      const report = readFileSync(path.join(ROOT, 'docs/phase-reports', file), 'utf8');
      const summary = readProgressSummary(report);
      if (!summary) continue;
      const visible = [
        summary.status,
        summary.summary,
        ...summary.built,
        ...summary.left,
        ...summary.pending.map((item) => item.text),
      ].join(' ');
      for (const word of EXCLUDED_WORDS) {
        expect(visible.toLowerCase(), `${file}: ${word}`).not.toContain(word);
      }
      expect(visible, `${file}: no internal codes`).not.toMatch(/\b[OPTD]-?\d/);
      expect(visible, `${file}: third person`).not.toMatch(/\b(you|your|owner)\b/i);
    }
  });

  it('shows no internal reference on the page itself', () => {
    const text = committed.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

    expect(text).not.toMatch(/\b[OPTD]-\d/);
    expect(text).not.toMatch(/\{|\}/);
  });
});
