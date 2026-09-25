import { describe, expect, it } from 'vitest';
import { parseCsv } from '../../../scripts/seed/parse-csv.ts';

describe('parseCsv (docs/seed-files.md format)', () => {
  it('reads quoted values with commas, quotes and line breaks, and drops a byte-order mark', () => {
    expect(parseCsv('﻿a,b\r\n"x, y","say ""hi"""\n"two\nlines",\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['two\nlines', ''],
    ]);
  });

  it('skips blank lines and keeps Arabic exactly', () => {
    expect(parseCsv('a\n\nالرئيس\n')).toEqual([['a'], ['الرئيس']]);
  });
});
