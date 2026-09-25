import { describe, expect, it } from 'vitest';
import { StandardRoleList } from '../../../../../src/web/features/committee-register/roles/standard-role-list';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

describe('StandardRoleList (brief 14 B2)', () => {
  it('lists the standard roles in the officer language, with nothing to change them', async () => {
    setBrowserLanguages(['ar']);
    const container = await renderForTest(
      <StandardRoleList
        roles={[{ id: 'r1', unitId: null, nameEn: 'Chair', nameAr: 'الرئيس', designation: null }]}
      />,
    );

    expect([...container.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['الرئيس']);
    expect(container.querySelector('button, form')).toBeNull();
  });
});
