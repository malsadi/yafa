import { describe, expect, it } from 'vitest';
import {
  ActiveSessionContext,
  type ActiveSession,
} from '../../../../src/web/app/session/active-session-context';
import { AdminStagePage } from '../../../../src/web/app/pages/admin-stage-page';
import { renderForTest, setBrowserLanguages } from '../../render-for-test';

function sessionWith(capabilities: string[]): ActiveSession {
  return {
    status: 'active',
    language: 'en',
    context: { personId: 'p1', units: [], roles: [], capabilities, isSystemAdmin: false },
    units: [],
    maintenanceMode: false,
  };
}

async function linksFor(capabilities: string[]) {
  setBrowserLanguages(['en-GB']);
  const container = await renderForTest(
    <ActiveSessionContext.Provider value={sessionWith(capabilities)}>
      <AdminStagePage />
    </ActiveSessionContext.Provider>,
    { path: '/admin/organisation', route: '/admin/:stageSlug' },
  );
  return [...container.querySelectorAll('a')].map((a) => a.textContent);
}

describe('AdminStagePage (brief 25; T-042)', () => {
  it('lists a screen to someone holding any one of its capabilities', async () => {
    expect(await linksFor(['administration-panel.role-designations.manage'])).toEqual(['Roles']);
    expect(await linksFor(['committee-register.standard-roles.manage'])).toEqual(['Roles']);
  });

  it('lists every screen of the stage the person may open, in order', async () => {
    expect(
      await linksFor([
        'committee-register.branches.manage',
        'committee-register.standard-roles.manage',
        'administration-panel.lists.manage',
      ]),
    ).toEqual(['Units', 'Roles', 'Lists']);
  });

  it('lists nothing to someone holding none of them', async () => {
    expect(await linksFor(['administration-panel.access-check.read'])).toEqual([]);
  });
});
