import type { AdministrationPanelStage } from './administration-panel-stages';

/**
 * The Administration panel screens built so far, by stage (brief 25), each
 * with the capability its own API checks. The stage page lists a screen
 * only to someone holding it — a UI hint; the server decides (T-042).
 */
export const ADMIN_SCREENS = [
  {
    stage: 'access-and-permissions',
    slug: 'permissions-matrix',
    capability: 'administration-panel.permissions-matrix.manage',
  },
] as const satisfies readonly {
  stage: AdministrationPanelStage;
  slug: string;
  capability: string;
}[];
