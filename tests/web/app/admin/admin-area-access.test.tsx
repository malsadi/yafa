import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { COMMITTEE_REGISTER_CAPABILITIES } from '../../../../src/shared/committee-register/capabilities';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { hasAdministrationCapability } from '../../../../src/web/app/admin/admin-area-access';
import { AdminLayout } from '../../../../src/web/app/layouts/admin-layout';
import { AdminStagePage } from '../../../../src/web/app/pages/admin-stage-page';
import {
  ActiveSessionContext,
  type ActiveSession,
} from '../../../../src/web/app/session/active-session-context';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

vi.mock('@clerk/react', () => ({
  useAuth: () => ({ getToken: () => Promise.resolve(null) }),
  SignOutButton: ({ children }: { children: ReactNode }) => children,
}));

// What a national register officer holds by the fixed rules (brief 7.3),
// read from the catalogue — with no Administration panel capability at all.
const NATIONAL_REGISTER_OFFICER = COMMITTEE_REGISTER_CAPABILITIES.filter((definition) =>
  definition.fixedGrants?.some((g) => g.designation === RoleDesignation.NationalRegisterOfficer),
).map((definition) => definition.capability);

function asOfficer(capabilities: string[], element: ReactNode): ReactNode {
  const session: ActiveSession = {
    status: 'active',
    language: 'en',
    context: { personId: 'p1', units: [], roles: [], capabilities, isSystemAdmin: false },
    units: [],
    maintenanceMode: false,
  };
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ActiveSessionContext.Provider value={session}>{element}</ActiveSessionContext.Provider>
    </QueryClientProvider>
  );
}

describe('the admin area (brief 25 build notes; D-072)', () => {
  it('opens for anyone holding an administration capability, and only for them', () => {
    expect(hasAdministrationCapability([])).toBe(false);
    expect(hasAdministrationCapability(['treasury.debit.create'])).toBe(false);
    expect(
      hasAdministrationCapability(['treasury.debit.create', 'administration-panel.x.read']),
    ).toBe(true);
    expect(hasAdministrationCapability(['committee-register.register.read'])).toBe(false);
    expect(hasAdministrationCapability(['administration-panel.lists.manage'])).toBe(true);
    expect(hasAdministrationCapability(['committee-register.branches.manage'])).toBe(true);
  });

  it('opens for a national register officer who is not a system administrator, showing only Units and Roles', async () => {
    setBrowserLanguages(['en-GB']);
    const layout = await renderForTest(asOfficer(NATIONAL_REGISTER_OFFICER, <AdminLayout />), {
      path: '/admin',
    });
    const stages = [...layout.querySelectorAll('nav[aria-label="Administration panel"] a')].map(
      (a) => a.textContent,
    );
    const page = await renderForTest(asOfficer(NATIONAL_REGISTER_OFFICER, <AdminStagePage />), {
      path: '/admin/organisation',
      route: '/admin/:stageSlug',
    });
    const screens = [...page.querySelectorAll('a')].map((a) => a.textContent);

    expect(NATIONAL_REGISTER_OFFICER).not.toHaveLength(0);
    expect(stages).toEqual(['Organisation']);
    expect(screens).toEqual(['Units', 'Roles']);
  });
});
