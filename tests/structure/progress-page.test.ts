import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildProgressPages,
  PROGRESS_PAGE_FILES,
} from '../../scripts/progress-page/generate-progress-page.ts';
import { readProgressSummary } from '../../scripts/progress-page/read-progress-summary.ts';

const ROOT = path.join(import.meta.dirname, '../..');
const LANGUAGES = ['en', 'ar'] as const;
const committed = Object.fromEntries(
  LANGUAGES.map((language) => [
    language,
    readFileSync(path.join(ROOT, PROGRESS_PAGE_FILES[language]), 'utf8'),
  ]),
) as Record<(typeof LANGUAGES)[number], string>;

// D-040, D-056: the page is public, so it holds build progress only.
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

const visibleText = (html: string) =>
  html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

describe.each(LANGUAGES)('public progress page, %s (D-040, D-058)', (language) => {
  const html = committed[language];

  it('is up to date with docs/ — run `npm run progress-page` in the same commit', () => {
    expect(html).toBe(buildProgressPages(ROOT)[language]);
  });

  it('is not indexed, loads nothing from anywhere, and runs no script', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).not.toMatch(/<script|https?:\/\/|<link |<img/i);
  });

  it('is one bar: a segment per phase, each opening its own panel, and nothing else', () => {
    const segments = [...html.matchAll(/popovertarget="(phase-\d+)" aria-label/g)].map((m) => m[1]);
    const panels = [...html.matchAll(/<section id="(phase-\d+)" class="panel \w+" popover/g)].map(
      (m) => m[1],
    );

    expect(html.match(/<ol class="bar">/g)).toHaveLength(1);
    expect(segments.length).toBeGreaterThan(1);
    expect(panels).toEqual(segments);
    expect(html).not.toMatch(/class="card/);
  });

  it('never shows a fill level for the phase in progress, and names it in the tally (D-064)', () => {
    const inProgressRule = /\.segment\.current \.seg-cloth\{[^}]*\}/.exec(html)?.[0] ?? '';

    expect(inProgressRule).not.toBe('');
    expect(inProgressRule).not.toMatch(/linear-gradient\(to /);
    expect(html).toMatch(/class="tally-current"/);
  });

  it('shows every panel in order with JavaScript off', () => {
    expect(html).toMatch(/<noscript><style>\.panel\{display:block;position:static/);
  });

  it('mirrors in Arabic', () => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    expect(html).toContain(`<html lang="${language}" dir="${dir}">`);
  });

  it('shows no internal reference', () => {
    expect(visibleText(html)).not.toMatch(/\b[OPTD]-\d|\{|\}/);
  });
});

describe('phase summaries, in public wording (D-056, D-058)', () => {
  it('keep to build progress, in plain third-person words, in both languages', () => {
    for (const file of readdirSync(path.join(ROOT, 'docs/phase-reports'))) {
      const summary = readProgressSummary(
        readFileSync(path.join(ROOT, 'docs/phase-reports', file), 'utf8'),
      );
      if (!summary) continue;
      const items = [
        summary.summary,
        ...summary.built,
        ...summary.left,
        ...summary.pending.map((p) => p.text),
      ];
      const english = items.map((item) => item.en).join(' ');
      const arabic = items.map((item) => item.ar).join(' ');
      for (const word of EXCLUDED_WORDS) {
        expect(english.toLowerCase(), `${file}: ${word}`).not.toContain(word);
      }
      expect(`${english} ${arabic}`, `${file}: no internal codes`).not.toMatch(/\b[OPTD]-?\d/);
      expect(english, `${file}: third person`).not.toMatch(/\b(you|your|owner)\b/i);
    }
  });
});
