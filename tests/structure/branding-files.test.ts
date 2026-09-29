import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { INSTALL_ICONS } from '../../src/shared/administration-panel/branding-files';

const ROOT = path.join(import.meta.dirname, '..', '..');
const read = (...parts: string[]) => readFileSync(path.join(ROOT, ...parts));

/** A PNG's width and height, from its header. */
function pngSize(bytes: Buffer): [number, number] {
  expect(bytes.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe('the fixed branding files (D-223)', () => {
  it('has the letterhead logo as a PNG, in src/branding', () => {
    pngSize(read('src', 'branding', 'logo.png'));
  });

  it('has the square logos in public/branding, at exactly the sizes phones need', () => {
    expect(pngSize(read('public', INSTALL_ICONS['192']))).toEqual([192, 192]);
    expect(pngSize(read('public', INSTALL_ICONS['512']))).toEqual([512, 512]);
  });

  it('has the Latin and Arabic fonts as WOFF2 files, in src/branding/fonts', () => {
    for (const font of ['latin.woff2', 'arabic.woff2'])
      expect(read('src', 'branding', 'fonts', font).subarray(0, 4).toString('latin1')).toBe('wOF2');
  });
});
