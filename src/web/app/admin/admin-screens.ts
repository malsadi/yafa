import type { AdministrationPanelStage } from './administration-panel-stages';

/**
 * The Administration panel screens built so far, by stage (brief 25), each
 * with the capabilities its own APIs check. The stage page lists a screen
 * to someone holding any of them — a UI hint; the server decides (T-042).
 */
export const ADMIN_SCREENS = [
  {
    stage: 'access-and-permissions',
    slug: 'system-administrators',
    capabilities: ['administration-panel.system-administrators.manage'],
  },
  {
    stage: 'access-and-permissions',
    slug: 'officer-accounts',
    capabilities: ['administration-panel.officer-accounts.manage'],
  },
  {
    stage: 'access-and-permissions',
    slug: 'permissions-matrix',
    capabilities: ['administration-panel.permissions-matrix.manage'],
  },
  {
    stage: 'access-and-permissions',
    slug: 'access-check',
    capabilities: ['administration-panel.access-check.read'],
  },
  {
    stage: 'organisation',
    slug: 'units',
    capabilities: ['committee-register.branches.manage'],
  },
  {
    stage: 'organisation',
    slug: 'roles',
    capabilities: [
      'committee-register.standard-roles.manage',
      'administration-panel.role-designations.manage',
    ],
  },
  {
    stage: 'organisation',
    slug: 'lists',
    capabilities: ['administration-panel.lists.manage'],
  },
  {
    stage: 'configuration',
    slug: 'service-settings',
    capabilities: ['administration-panel.service-settings.manage'],
  },
  {
    stage: 'configuration',
    slug: 'service-switches',
    capabilities: ['administration-panel.service-switches.manage'],
  },
  {
    stage: 'configuration',
    slug: 'notifications',
    capabilities: ['administration-panel.notifications.manage'],
  },
  {
    stage: 'configuration',
    slug: 'setup-checklist',
    capabilities: ['administration-panel.setup-checklist.read'],
  },
] as const satisfies readonly {
  stage: AdministrationPanelStage;
  slug: string;
  capabilities: readonly string[];
}[];
