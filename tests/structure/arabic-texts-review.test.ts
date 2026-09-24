import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';
import { renderArabicTextsReview } from '../../scripts/arabic-texts-review/render-arabic-texts-review.ts';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

const DOC = path.join(import.meta.dirname, '../../docs/arabic-texts-review.md');

// D-037: the side-by-side review file never drifts from the text files.
it('docs/arabic-texts-review.md is up to date (run `npm run arabic-texts-review`)', () => {
  const files = [
    { file: 'portal-shell.ts', english: englishText.portalShell, arabic: arabicText.portalShell },
    ...Object.keys(englishText.services).map((slug) => {
      const key = slug as keyof typeof englishText.services;
      return {
        file: `${slug}.ts`,
        english: englishText.services[key],
        arabic: arabicText.services[key],
      };
    }),
  ];
  const rendered = renderArabicTextsReview(files);
  if (process.env.UPDATE_ARABIC_TEXTS_REVIEW === '1') {
    writeFileSync(DOC, rendered);
  }
  expect(readFileSync(DOC, 'utf8')).toBe(rendered);
});
