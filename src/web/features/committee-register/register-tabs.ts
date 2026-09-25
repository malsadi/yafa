/**
 * Brief 14's register views, each with the capabilities its API checks —
 * a view is offered to someone holding any of them (a UI hint; the server
 * decides, T-042).
 */
export const REGISTER_TABS = [
  {
    slug: 'officers',
    capabilities: ['committee-register.register.read', 'committee-register.officers.manage'],
  },
  {
    slug: 'past-officers',
    capabilities: ['committee-register.register.read', 'committee-register.officers.manage'],
  },
  { slug: 'roles', capabilities: ['committee-register.branch-roles.manage'] },
  {
    slug: 'elections',
    capabilities: [
      'committee-register.register.read',
      'committee-register.elections.manage',
      'committee-register.elections.confirm',
    ],
  },
  {
    slug: 'handovers',
    capabilities: ['committee-register.register.read', 'committee-register.handovers.manage'],
  },
] as const;

export type RegisterTab = (typeof REGISTER_TABS)[number]['slug'];
