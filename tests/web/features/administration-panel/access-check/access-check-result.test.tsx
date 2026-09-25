import { describe, expect, it } from 'vitest';
import type { AccessCheck } from '../../../../../src/shared/administration-panel/access-check';
import { PermissionScope } from '../../../../../src/shared/core/permission-scope';
import { AccessCheckResult } from '../../../../../src/web/features/administration-panel/access-check/access-check-result';
import { renderForTest, setBrowserLanguages } from '../../../render-for-test';

const CHECK: AccessCheck = {
  personId: 'p1',
  name: 'Ada Example',
  isSystemAdministrator: false,
  currentTerms: [
    {
      unitId: 'u1',
      unitNameEn: 'Example Branch',
      unitNameAr: 'فرع المثال',
      roleNameEn: 'Secretary',
      roleNameAr: 'السكرتير',
    },
  ],
  grants: [
    {
      capability: 'committee-register.register.read',
      scope: PermissionScope.OwnUnit,
      unitId: 'u1',
      source: 'matrix',
    },
  ],
};

describe('AccessCheckResult (brief 25 A4)', () => {
  it('shows current terms and each capability with scope, unit and source', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(<AccessCheckResult check={CHECK} />);
    const items = [...container.querySelectorAll('li')].map((li) => li.textContent);

    expect(items).toEqual([
      'Secretary, Example Branch',
      'Read the register · Own unit · Example Branch · from the permissions matrix',
    ]);
  });

  it('says so when someone holds nothing', async () => {
    setBrowserLanguages(['en-GB']);
    const container = await renderForTest(
      <AccessCheckResult check={{ ...CHECK, currentTerms: [], grants: [] }} />,
    );

    expect(container.textContent).toContain('No current terms.');
    expect(container.textContent).toContain('No capabilities.');
  });
});
