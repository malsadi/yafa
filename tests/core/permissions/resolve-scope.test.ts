import { describe, expect, it } from 'vitest';
import { resolveScope } from '../../../src/worker/core/permissions/resolve-scope';
import { PermissionScope } from '../../../src/shared/core/permission-scope';

const BRANCH_A = '01ARZ3NDEKTSV4RRFFQ69G5UNA';
const BRANCH_B = '01ARZ3NDEKTSV4RRFFQ69G5UNB';
const NATIONAL = '01ARZ3NDEKTSV4RRFFQ69G5NAT';

describe('resolveScope', () => {
  it('own unit: covers only the exact unit the grant belongs to', () => {
    const grant = { unitId: BRANCH_A, scope: PermissionScope.OwnUnit };

    expect(resolveScope(grant, BRANCH_A, false)).toBe(true);
    expect(resolveScope(grant, BRANCH_B, false)).toBe(false);
  });

  it('all units: covers any requested unit, including the national unit', () => {
    const grant = { unitId: BRANCH_A, scope: PermissionScope.AllUnits };

    expect(resolveScope(grant, BRANCH_B, false)).toBe(true);
    expect(resolveScope(grant, NATIONAL, true)).toBe(true);
  });

  it('national content: covers only a unit whose own type is national', () => {
    const grant = { unitId: BRANCH_A, scope: PermissionScope.NationalContent };

    expect(resolveScope(grant, NATIONAL, true)).toBe(true);
    expect(resolveScope(grant, BRANCH_A, false)).toBe(false);
  });
});
