import { describe, expect, it } from 'vitest';
import { detectBrowserLanguage } from '../../../../src/web/app/language/detect-browser-language';

describe('detectBrowserLanguage (brief section 8.5)', () => {
  it('picks Arabic for an Arabic-preferring browser, whatever the region', () => {
    expect(detectBrowserLanguage(['ar-SA', 'en-GB'])).toBe('ar');
    expect(detectBrowserLanguage(['AR'])).toBe('ar');
  });

  it('picks the first preferred language the portal has', () => {
    expect(detectBrowserLanguage(['fr-FR', 'en-GB', 'ar'])).toBe('en');
    expect(detectBrowserLanguage(['fr-FR', 'ar', 'en'])).toBe('ar');
  });

  it('falls back to the first portal language when the browser prefers neither (O-018)', () => {
    expect(detectBrowserLanguage(['fr-FR'])).toBe('en');
    expect(detectBrowserLanguage([])).toBe('en');
  });
});
