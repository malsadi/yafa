import { describe, expect, it, vi } from 'vitest';
import type { CurrentOfficerRecord } from '../../../../../src/shared/committee-register/officer-record';
import { OfficerRow } from '../../../../../src/web/features/committee-register/officers/officer-row';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const OFFICER: CurrentOfficerRecord = {
  termId: 't1',
  personId: 'p1',
  name: 'Ada Example',
  email: 'ada.example@example.org',
  phone: '07700 900123',
  roleId: 'r1',
  roleNameEn: 'Secretary',
  roleNameAr: 'السكرتير',
  startDate: '2026-01-01',
  endDate: '2026-10-01',
  endingSoon: true,
};

async function render(officer: CurrentOfficerRecord, canManage: boolean) {
  setBrowserLanguages(['en-GB']);
  return renderForTest(
    <ul>
      <OfficerRow
        officer={officer}
        canManage={canManage}
        busy={false}
        onUpdate={vi.fn()}
        onEnd={vi.fn()}
      />
    </ul>,
  );
}

describe('OfficerRow (brief 14 B1, B3)', () => {
  it('shows the role, contact details and term dates, and highlights a term ending soon', async () => {
    const container = await render(OFFICER, false);

    expect(container.textContent).toContain('Ada Example · Secretary');
    expect(container.textContent).toContain('Ending soon');
    expect(container.textContent).toContain('1 January 2026 to 1 October 2026');
    expect(container.querySelector('li')?.className).toContain('border-amber-500');
  });

  it('shows no highlight when the term is not ending soon, or the window is not set', async () => {
    for (const endingSoon of [false, null]) {
      const container = await render({ ...OFFICER, endingSoon }, false);
      expect(container.textContent).not.toContain('Ending soon');
    }
  });

  it('offers changes only to someone who manages the register', async () => {
    expect((await render(OFFICER, false)).querySelectorAll('button')).toHaveLength(0);
    expect((await render(OFFICER, true)).querySelectorAll('button')).toHaveLength(2);
  });
});
