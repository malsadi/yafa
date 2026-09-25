import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RoleDesignation } from '../../../../../src/shared/committee-register/role-designation';
import { StandardRoleRow } from '../../../../../src/web/features/administration-panel/roles/standard-role-row';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const ROLE = {
  id: 'r1',
  unitId: null,
  nameEn: 'Secretary',
  nameAr: 'السكرتير',
  designation: RoleDesignation.BranchRegisterOfficer,
};

async function click(element: Element | null | undefined) {
  await act(async () => {
    (element as HTMLElement | null)?.click();
    await Promise.resolve();
  });
}

describe('StandardRoleRow (brief 14 B2, 25 B2)', () => {
  it('shows the role in the officer language, with its designation', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <ul>
        <StandardRoleRow role={ROLE} busy={false} onRename={vi.fn()} />
      </ul>,
    );

    expect(container.querySelector('p')?.textContent).toBe('السكرتير · مسؤول سجل الفرع');
  });

  it('renames in both languages', async () => {
    setBrowserLanguages(['en-GB']);
    const onRename = vi.fn();
    const container = await renderForTest(
      <ul>
        <StandardRoleRow role={ROLE} busy={false} onRename={onRename} />
      </ul>,
    );
    await click(container.querySelector('button[aria-label="Rename Secretary"]'));
    await act(async () => {
      container.querySelector('form')?.requestSubmit();
      await Promise.resolve();
    });

    expect(onRename).toHaveBeenCalledWith({ nameEn: 'Secretary', nameAr: 'السكرتير' });
    expect(container.querySelector('form')).toBeNull();
  });
});
