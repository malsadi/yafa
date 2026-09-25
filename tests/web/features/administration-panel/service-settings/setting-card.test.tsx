import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ServiceSettingView } from '../../../../../src/shared/administration-panel/service-settings';
import { SettingCard } from '../../../../../src/web/features/administration-panel/service-settings/setting-card';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const MFA: ServiceSettingView = {
  key: 'committee-register.roles_requiring_mfa',
  service: 'committee-register',
  required: false,
  unitOverrideAllowed: false,
  input: { kind: 'roles' },
  national: null,
  overrides: [],
};
const ROLES = [
  { id: 'r1', nameEn: 'Treasurer', nameAr: 'أمين الصندوق' },
  { id: 'r2', nameEn: 'Chair', nameAr: 'الرئيس' },
];

async function click(container: HTMLElement, selector: string) {
  await act(async () => {
    container.querySelector<HTMLElement>(selector)?.click();
    await Promise.resolve();
  });
}

describe('SettingCard (brief 25 C1)', () => {
  it('says a setting is not set, and sets roles by ticking them', async () => {
    setBrowserLanguages(['en-GB']);
    const onSet = vi.fn();
    const container = await renderForTest(
      <ul>
        <SettingCard
          setting={MFA}
          units={[]}
          roles={ROLES}
          refusal={null}
          busy={false}
          onSet={onSet}
          onRemoveOverride={vi.fn()}
          onRestore={vi.fn()}
        />
      </ul>,
    );

    expect(container.textContent).toContain('Roles requiring multi-factor authentication');
    expect(container.textContent).toContain('Not set');
    await click(container, '[aria-label="Change Roles requiring multi-factor authentication"]');
    const boxes = [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    expect(boxes.map((b) => b.parentElement?.textContent)).toEqual(['Treasurer', 'Chair']);
    await click(container, 'input[type="checkbox"]');
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });
    expect(onSet).toHaveBeenCalledWith(['r1']);
  });

  it('marks a required setting, and offers unit overrides only where allowed', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <ul>
        <SettingCard
          setting={{ ...MFA, required: true, unitOverrideAllowed: true, national: ['r2'] }}
          units={[{ id: 'u1', nameEn: 'North', nameAr: 'الشمال' }]}
          roles={ROLES}
          refusal={null}
          busy={false}
          onSet={vi.fn()}
          onRemoveOverride={vi.fn()}
          onRestore={vi.fn()}
        />
      </ul>,
    );

    expect(container.textContent).toContain('Required');
    expect(container.textContent).toContain('Chair');
    expect(container.textContent).toContain('No unit has its own value.');
  });
});
