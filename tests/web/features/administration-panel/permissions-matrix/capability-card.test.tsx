import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { MatrixRole } from '../../../../../src/shared/administration-panel/permissions-matrix';
import { ADMINISTRATION_PANEL_CAPABILITIES } from '../../../../../src/shared/administration-panel/capabilities';
import { COMMITTEE_REGISTER_CAPABILITIES } from '../../../../../src/shared/committee-register/capabilities';
import { CapabilityCard } from '../../../../../src/web/features/administration-panel/permissions-matrix/capability-card';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const ROLE: MatrixRole = {
  id: 'r1',
  unitId: null,
  nameEn: 'Chair',
  nameAr: 'الرئيس',
  designation: null,
};
const READ = COMMITTEE_REGISTER_CAPABILITIES.find(
  (c) => c.capability === 'committee-register.register.read',
);
const FIXED = COMMITTEE_REGISTER_CAPABILITIES.find(
  (c) => c.capability === 'committee-register.officers.manage',
);
const PORTAL_WIDE = ADMINISTRATION_PANEL_CAPABILITIES[0];
if (!READ || !FIXED || !PORTAL_WIDE) throw new Error('catalogue fixtures missing');

describe('CapabilityCard (brief 25 A3, T-079)', () => {
  it('shows a fixed rule locked, naming who holds it, with nothing to tick', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <CapabilityCard
        definition={FIXED}
        roles={[ROLE]}
        grants={[]}
        saving={false}
        onChange={vi.fn()}
      />,
    );

    expect(container.textContent).toContain('Fixed rule');
    expect(container.textContent).toContain('Branch register officer (Own unit)');
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
  });

  it('offers only the allowed scopes, ticked as granted, and reports the new set', async () => {
    const onChange = vi.fn();
    const container = await renderForTest(
      <CapabilityCard
        definition={READ}
        roles={[ROLE]}
        grants={[{ roleId: 'r1', capability: READ.capability, scope: 'own unit' }]}
        saving={false}
        onChange={onChange}
      />,
    );
    const boxes = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];

    expect(boxes.map((box) => [box.parentElement?.textContent, box.checked])).toEqual([
      ['Own unit', true],
      ['All units', false],
    ]);
    await act(async () => {
      boxes[1]?.click();
      await Promise.resolve();
    });
    expect(onChange).toHaveBeenCalledWith('r1', ['own unit', 'all units']);
  });

  it('names the capability and the role in Arabic', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <CapabilityCard
        definition={PORTAL_WIDE}
        roles={[ROLE]}
        grants={[]}
        saving={false}
        onChange={vi.fn()}
      />,
    );
    setBrowserLanguages(['en-GB']);

    expect(container.textContent).toContain('تعيين مسؤولي النظام وإعفاؤهم');
    expect(container.textContent).toContain('الرئيس');
    expect(container.textContent).toContain('جميع الوحدات');
  });
});
