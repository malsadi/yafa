import { describe, expect, it } from 'vitest';
import { sanitizeFileName } from '../../../src/worker/core/files';

describe('sanitizeFileName', () => {
  it('leaves an ordinary English name unchanged', () => {
    expect(sanitizeFileName('receipt.jpg')).toBe('receipt.jpg');
  });

  it('preserves Arabic script — never reduces a name to ASCII', () => {
    expect(sanitizeFileName('إيصال.jpg')).toBe('إيصال.jpg');
  });

  it('replaces path separators so the key gains no extra "folders"', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('..-..-etc-passwd');
    expect(sanitizeFileName('a\\b/c.txt')).toBe('a-b-c.txt');
  });

  it('strips control characters', () => {
    expect(sanitizeFileName('bad\u0000name\u001f.txt')).toBe('badname.txt');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeFileName('  spaced.txt  ')).toBe('spaced.txt');
  });

  it('rejects a name that is nothing but control characters', () => {
    expect(() => sanitizeFileName('\u0000\u0001\u001f')).toThrow(RangeError);
  });

  it('truncates a very long name to the byte budget without cutting a multi-byte character in half', () => {
    const longArabicName = 'إ'.repeat(500) + '.jpg';

    const result = sanitizeFileName(longArabicName, 50);

    expect(new TextEncoder().encode(result).length).toBeLessThanOrEqual(50);
    expect(result.length).toBeGreaterThan(0);
  });
});
