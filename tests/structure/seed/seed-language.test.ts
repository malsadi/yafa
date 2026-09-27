import { describe, expect, it } from 'vitest';
import { readSeedLanguage } from '../../../scripts/seed/seed-language';

describe('the language the seeded people start with (D-212)', () => {
  it('is read from --language, English or Arabic', () => {
    const errors: string[] = [];
    expect(readSeedLanguage(['--target', 'local', '--language', 'ar'], errors)).toBe('ar');
    expect(readSeedLanguage(['--language', 'en', '--apply'], errors)).toBe('en');
    expect(errors).toEqual([]);
  });

  it('stops the load when it is missing or not a portal language', () => {
    for (const args of [['--target', 'local'], ['--language'], ['--language', 'fr']]) {
      const errors: string[] = [];
      expect(readSeedLanguage(args, errors)).toBeNull();
      expect(errors).toEqual([
        'Choose the language the seeded people start with: --language en or --language ar.',
      ]);
    }
  });
});
