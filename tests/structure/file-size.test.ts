import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listSourceFiles } from './list-source-files';

// Brief section 5.2: source files stay under 250 lines. ESLint's own
// max-lines rule fails the build at 300; this test holds the stricter,
// internal target so a file is flagged before it gets anywhere near that.
const MAX_LINES = 250;
const SOURCE_ROOT = join(import.meta.dirname, '..', '..', 'src');

describe('source file size', () => {
  it('keeps every source file under 250 lines', () => {
    const oversized = listSourceFiles(SOURCE_ROOT)
      .filter((file) => /\.(ts|tsx)$/.test(file))
      .map((file) => ({ file, lines: readFileSync(file, 'utf8').split('\n').length }))
      .filter(({ lines }) => lines > MAX_LINES);

    expect(oversized).toEqual([]);
  });
});
