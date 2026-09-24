import { describe, expect, it } from 'vitest';
import type { MeUnit } from '../../../../src/shared/core/me-response';
import { ServicePage } from '../../../../src/web/app/pages/service-page';
import { SelectedUnitProvider } from '../../../../src/web/app/unit/selected-unit-provider';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const UNIT: MeUnit = {
  id: 'unit-1',
  type: 'branch',
  nameEn: 'Fictional Branch',
  nameAr: 'الفرع التجريبي',
  enabledServices: ['treasury', 'committee-register', 'documents-archive', 'administration-panel'],
};

async function renderServicePage(path: string): Promise<HTMLElement> {
  setBrowserLanguages(['en-GB']);
  return renderForTest(
    <SelectedUnitProvider units={[UNIT]}>
      <ServicePage />
    </SelectedUnitProvider>,
    { path, route: '/:serviceSlug' },
  );
}

describe('ServicePage (brief sections 8.4 and 26)', () => {
  it("shows a switched-on service's page with its exact name", async () => {
    const container = await renderServicePage('/treasury');

    expect(container.querySelector('h1')?.textContent).toBe('Treasury');
  });

  it('hides a service switched off for the selected unit', async () => {
    const container = await renderServicePage('/calendar');

    expect(container.querySelector('h1')).toBeNull();
    expect(container.textContent).toBe('This page does not exist.');
  });

  it('never serves the Administration panel as a portal service page', async () => {
    const container = await renderServicePage('/administration-panel');

    expect(container.querySelector('h1')).toBeNull();
  });
});
