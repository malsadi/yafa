import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { unstable_startWorker } from 'wrangler';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// The opt-in core/pdf check (T-072, D-030). Each run makes exactly two
// Browser Rendering calls, one per language. Saves both PDFs for the
// owner's visual review, and asserts from the PDF itself (`pdffonts`) that
// only the embedded fixture fonts were used — no fallback font anywhere.
const SAMPLES_DIR = path.join(import.meta.dirname, '../../docs/pdf-samples');
let worker: Awaited<ReturnType<typeof unstable_startWorker>>;

beforeAll(async () => {
  worker = await unstable_startWorker({
    config: path.join(import.meta.dirname, 'wrangler.jsonc'),
  });
  await worker.ready;
});

afterAll(async () => {
  await worker.dispose();
});

async function renderSample(language: 'en' | 'ar'): Promise<string[]> {
  const response = await worker.fetch(`http://sample/?language=${language}`);
  expect(response.status).toBe(200);
  const file = path.join(SAMPLES_DIR, `core-pdf-sample-${language}.pdf`);
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  const report = execFileSync('pdffonts', [file], { encoding: 'utf8' });
  return report
    .split('\n')
    .slice(2)
    .filter((line) => line.trim() !== '')
    .map((line) => line.split(/\s+/)[0] ?? '');
}

describe('core/pdf through Browser Rendering (brief section 9.4)', () => {
  it('renders English using only the embedded Latin font', async () => {
    const fonts = await renderSample('en');

    expect(fonts.length).toBeGreaterThan(0);
    for (const font of fonts) {
      expect(font).toMatch(/^[A-Z]{6}\+NotoSans/);
    }
  });

  it('renders Arabic using only the embedded Arabic and Latin fonts', async () => {
    const fonts = await renderSample('ar');

    expect(fonts.some((font) => /^[A-Z]{6}\+NotoNaskhArabic/.test(font))).toBe(true);
    for (const font of fonts) {
      expect(font).toMatch(/^[A-Z]{6}\+(NotoNaskhArabic|NotoSans)/);
    }
  });
});
