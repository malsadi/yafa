import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

const ROOT = path.join(import.meta.dirname, '../..');

// D-059: in Arabic the name is always يافع, never another spelling.
const OTHER_SPELLINGS = /يافا|يافه|يافة/;

function arabicSources(): string[] {
  const textDir = path.join(ROOT, 'src/web/text/ar');
  const reports = path.join(ROOT, 'docs/phase-reports');
  return [
    ...readdirSync(textDir).map((file) => path.join(textDir, file)),
    ...readdirSync(reports).map((file) => path.join(reports, file)),
    path.join(ROOT, 'docs/progress-page-text.md'),
    path.join(ROOT, 'docs/current-work.md'),
  ];
}

it('writes the name only as يافع in every Arabic source', () => {
  for (const file of arabicSources()) {
    expect(readFileSync(file, 'utf8'), path.relative(ROOT, file)).not.toMatch(OTHER_SPELLINGS);
  }
});
