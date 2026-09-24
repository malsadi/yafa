import { describe, expect, it } from 'vitest';
import { arabicText } from '../../src/web/text/ar';
import { englishText } from '../../src/web/text/en';

// Brief section 8.5: "A test fails if a text key exists in one language and
// not the other." Compares the full key paths of both bundles. Paths are
// lists, not dotted strings: some keys (capability names) contain dots.
function keyPaths(value: unknown, prefix: string[] = []): string[][] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, [...prefix, key]));
}

function valueAt(bundle: unknown, path: string[]): unknown {
  return path.reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], bundle);
}

const asText = (paths: string[][]) => paths.map((path) => JSON.stringify(path)).sort();

describe('text bundles (brief section 8.5)', () => {
  it('has exactly the same keys in English and Arabic', () => {
    expect(asText(keyPaths(arabicText))).toEqual(asText(keyPaths(englishText)));
  });

  it('has no empty text in either language', () => {
    for (const bundle of [englishText, arabicText]) {
      for (const path of keyPaths(bundle)) {
        const value = valueAt(bundle, path);
        expect(typeof value === 'string' && value.trim().length > 0, path.join(' › ')).toBe(true);
      }
    }
  });
});
