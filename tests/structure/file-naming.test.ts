import { basename } from 'node:path';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listSourceFiles } from './list-source-files';

// Brief section 5.1: name files by their job, never a vague catch-all name.
const FORBIDDEN_NAMES = new Set([
  'utils.ts',
  'utils.tsx',
  'helpers.ts',
  'helpers.tsx',
  'misc.ts',
  'misc.tsx',
  'common.ts',
  'common.tsx',
  'stuff.ts',
  'temp.ts',
]);
const SOURCE_ROOT = join(import.meta.dirname, '..', '..', 'src');

describe('file naming', () => {
  it('has no forbidden, vague file names', () => {
    const offenders = listSourceFiles(SOURCE_ROOT)
      .map((file) => basename(file))
      .filter((name) => FORBIDDEN_NAMES.has(name));

    expect(offenders).toEqual([]);
  });
});
