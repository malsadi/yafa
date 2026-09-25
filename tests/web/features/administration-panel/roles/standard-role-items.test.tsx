import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoleDesignation } from '../../../../../src/shared/committee-register/role-designation';
import { StandardRoleItems } from '../../../../../src/web/features/administration-panel/roles/standard-role-items';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const ROLES = [
  { id: 'r1', unitId: null, nameEn: 'Chair', nameAr: 'الرئيس', designation: null },
  {
    id: 'r2',
    unitId: null,
    nameEn: 'Secretary',
    nameAr: 'السكرتير',
    designation: RoleDesignation.BranchRegisterOfficer,
  },
];

describe('StandardRoleItems (brief 14 B2, D-071)', () => {
  it('shows the roles in order with designations, and moves one', async () => {
    setBrowserLanguages(['en-GB']);
    const onOrder = vi.fn();
    const container = await renderForTest(
      <StandardRoleItems roles={ROLES} busy={false} onRename={vi.fn()} onOrder={onOrder} />,
    );

    expect([...container.querySelectorAll('li p')].map((p) => p.textContent)).toEqual([
      'Chair',
      'Secretary · Branch register officer',
    ]);
    await act(async () => {
      container.querySelector<HTMLElement>('[aria-label="Move Secretary up"]')?.click();
      await Promise.resolve();
    });
    expect(onOrder).toHaveBeenCalledWith(['r2', 'r1']);
  });
});
