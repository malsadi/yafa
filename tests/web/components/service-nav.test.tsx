import { afterEach, describe, expect, it } from 'vitest';
import { ServiceNav } from '../../../src/web/components/service-nav';
import { renderForTest, setBrowserLanguages } from '../render-for-test';

afterEach(() => {
  setBrowserLanguages(['en-GB']);
});

function linkTexts(container: HTMLElement): string[] {
  return [...container.querySelectorAll('a')].map((link) => link.textContent);
}

describe('ServiceNav (brief sections 8.4 and 26)', () => {
  it('lists only the switched-on services, never the Administration panel as a service', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ServiceNav
        services={['treasury', 'committee-register', 'administration-panel']}
        showAdministration={false}
      />,
    );

    expect(linkTexts(container)).toEqual(['Treasury', 'Committee register']);
  });

  it('adds the Administration panel link only for an administration capability', async () => {
    const container = await renderForTest(
      <ServiceNav services={['committee-register']} showAdministration={true} />,
    );

    expect(linkTexts(container)).toEqual(['Committee register', 'Administration panel']);
    expect(container.querySelector('a[href="/admin"]')).not.toBeNull();
  });

  it('shows Arabic names, right-to-left, for an Arabic browser', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <ServiceNav services={['treasury']} showAdministration={false} />,
    );

    expect(linkTexts(container)).toEqual(['الخزينة']);
    expect(document.documentElement.dir).toBe('rtl');
  });
});
