import { describe, expect, it } from 'vitest';
import { HomeLink } from '../../../src/web/components/home-link';
import { renderForTest, setBrowserLanguages } from '../render-for-test';

describe('HomeLink (D-224)', () => {
  it('leads to the home page from anywhere, in either language', async () => {
    setBrowserLanguages(['en-GB']);
    const english = await renderForTest(<HomeLink />, { path: '/treasury/accounts' });
    expect(english.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(english.textContent).toBe('Home');

    setBrowserLanguages(['ar']);
    const arabic = await renderForTest(<HomeLink />, { path: '/admin' });
    expect(arabic.textContent).toBe('الرئيسية');
  });
});
