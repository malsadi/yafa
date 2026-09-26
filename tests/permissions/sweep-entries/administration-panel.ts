import type { RouteDeclaration } from '../../../src/worker/core/permissions';

/** Brief 7.4: the administration-panel routes, in the order the app registers them. */
export const ADMINISTRATION_PANEL_SWEEP_ENTRIES: RouteDeclaration[] = [
  {
    method: 'GET',
    path: '/api/administration-panel/system-administrators',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/system-administrators/candidates',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/system-administrators',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/administration-panel/system-administrators/:personId',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/permissions-matrix',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/permissions-matrix/cells',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/permissions-matrix/versions',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/permissions-matrix/versions/:number/restore',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/role-designations',
    access: { kind: 'capability', capability: 'administration-panel.role-designations.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/role-designations',
    access: { kind: 'capability', capability: 'administration-panel.role-designations.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/officer-accounts',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/invitation',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/lock',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/unlock',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/sign-out',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/revoke-calendar-feed',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/remove-push-devices',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/lists',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/lists/:list/items',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/administration-panel/lists/:list/items/:itemId',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/lists/:list/items/:itemId/retire',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/lists/:list/items/:itemId/restore',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/lists/:list/order',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/access-check/people',
    access: { kind: 'capability', capability: 'administration-panel.access-check.read' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/access-check/people/:personId',
    access: { kind: 'capability', capability: 'administration-panel.access-check.read' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/setup-checklist',
    access: { kind: 'capability', capability: 'administration-panel.setup-checklist.read' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/setup-checklist/settings/:key',
    access: { kind: 'capability', capability: 'administration-panel.setup-checklist.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/service-settings',
    access: { kind: 'capability', capability: 'administration-panel.service-settings.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/service-settings/:key',
    access: { kind: 'capability', capability: 'administration-panel.service-settings.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/administration-panel/service-settings/:key/overrides/:unitId',
    access: { kind: 'capability', capability: 'administration-panel.service-settings.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/service-settings/:key/history',
    access: { kind: 'capability', capability: 'administration-panel.service-settings.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/service-settings/:key/history/:historyId/restore',
    access: { kind: 'capability', capability: 'administration-panel.service-settings.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/service-switches',
    access: { kind: 'capability', capability: 'administration-panel.service-switches.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/service-switches/:service',
    access: { kind: 'capability', capability: 'administration-panel.service-switches.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/notifications',
    access: { kind: 'capability', capability: 'administration-panel.notifications.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/notifications/alert-types',
    access: { kind: 'capability', capability: 'administration-panel.notifications.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/notifications/install-guide',
    access: { kind: 'capability', capability: 'administration-panel.notifications.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/texts',
    access: { kind: 'capability', capability: 'administration-panel.texts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/texts/privacy-notice',
    access: { kind: 'capability', capability: 'administration-panel.texts.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/texts/:key',
    access: { kind: 'capability', capability: 'administration-panel.texts.manage' },
  },
  { method: 'GET', path: '/api/branding', access: { kind: 'signed-in-only' } },
  {
    method: 'PUT',
    path: '/api/administration-panel/branding',
    access: { kind: 'capability', capability: 'administration-panel.branding.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/branding/files/:slot/uploads',
    access: { kind: 'capability', capability: 'administration-panel.branding.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/branding/files/:slot',
    access: { kind: 'capability', capability: 'administration-panel.branding.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/branding/letterhead-preview',
    access: { kind: 'capability', capability: 'administration-panel.branding.manage' },
  },
];
