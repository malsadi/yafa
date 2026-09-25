import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { inLanguage } from '../../../src/web/app/language/in-language';
import { OfficerText } from '../../../src/web/components/officer-text';
import { englishText } from '../../../src/web/text/en';
import { renderForTest, setBrowserLanguages } from '../render-for-test';

vi.mock('@clerk/react', () => ({ useAuth: () => ({ getToken: () => Promise.resolve(null) }) }));

async function render(response: Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(response)),
  );
  const container = await renderForTest(
    <QueryClientProvider client={new QueryClient()}>
      <OfficerText textKey="help" />
    </QueryClientProvider>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return container;
}

describe('the administrator’s texts on screen (brief 25 C5; D-022)', () => {
  it('shows English while the Arabic is not written', () => {
    expect(inLanguage({ textEn: 'Help.', textAr: null }, 'ar')).toBe('Help.');
    expect(inLanguage({ textEn: 'Help.', textAr: 'مساعدة.' }, 'ar')).toBe('مساعدة.');
    expect(inLanguage({ textEn: 'Help.', textAr: 'مساعدة.' }, 'en')).toBe('Help.');
  });

  it('shows the text in the officer’s language, as typed', async () => {
    setBrowserLanguages(['ar']);
    const container = await render(
      new Response(JSON.stringify({ key: 'help', textEn: 'Help.', textAr: 'مساعدة.' }), {
        status: 200,
      }),
    );
    expect(container.textContent).toBe('مساعدة.');
  });

  it('says it is not set up while not written', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await render(
      new Response(JSON.stringify({ error: { code: 'texts.not-written' } }), { status: 404 }),
    );
    expect(container.textContent).toBe(englishText.portalShell.notConfigured);
  });
});
