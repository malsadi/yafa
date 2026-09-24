import { describe, expect, it } from 'vitest';
import type { MeUnit } from '../../../../src/shared/core/me-response';
import { HomePage } from '../../../../src/web/app/pages/home-page';
import { SelectedUnitProvider } from '../../../../src/web/app/unit/selected-unit-provider';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

const UNIT: MeUnit = {
  id: 'unit-1',
  type: 'branch',
  nameEn: 'Fictional Branch',
  nameAr: 'الفرع التجريبي',
  enabledServices: ['committee-register'],
};

describe('HomePage (D-035)', () => {
  it('shows the welcome line and the selected unit, and nothing more', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <SelectedUnitProvider units={[UNIT]}>
        <HomePage />
      </SelectedUnitProvider>,
    );

    expect(container.querySelector('h1')?.textContent).toBe('Welcome to the committee portal.');
    expect(container.textContent).toBe('Welcome to the committee portal.Unit: Fictional Branch');
  });
});
