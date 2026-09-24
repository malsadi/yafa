import { describe, expect, it } from 'vitest';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

// Brief section 8.5: "A test fails if a text key exists in one language and
// not the other." Compares the full key paths of both bundles.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('text bundles (brief section 8.5)', () => {
  it('has exactly the same keys in English and Arabic', () => {
    expect(keyPaths(arabicText).sort()).toEqual(keyPaths(englishText).sort());
  });

  it('has no empty text in either language', () => {
    for (const bundle of [englishText, arabicText]) {
      for (const path of keyPaths(bundle)) {
        const value = path.split('.').reduce<unknown>((node, key) => {
          return (node as Record<string, unknown>)[key];
        }, bundle);
        expect(typeof value === 'string' && value.trim().length > 0, path).toBe(true);
      }
    }
  });
});
