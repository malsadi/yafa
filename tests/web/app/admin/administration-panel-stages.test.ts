import { describe, expect, it } from 'vitest';
import { hasAdministrationCapability } from '../../../../src/web/app/admin/administration-panel-stages';

describe('hasAdministrationCapability (brief section 25 build notes)', () => {
  it('is true only with at least one administration-panel capability', () => {
    expect(hasAdministrationCapability([])).toBe(false);
    expect(hasAdministrationCapability(['treasury.debit.create'])).toBe(false);
    expect(
      hasAdministrationCapability(['treasury.debit.create', 'administration-panel.x.read']),
    ).toBe(true);
  });
});
