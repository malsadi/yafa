import type { RouteObject } from 'react-router';
import { AdminLayout } from '../layouts/admin-layout';
import { PermissionsMatrixPage } from '../../features/administration-panel/permissions-matrix/permissions-matrix-page';
import { AccessCheckPage } from '../../features/administration-panel/access-check/access-check-page';
import { OfficerAccountsPage } from '../../features/administration-panel/officer-accounts/officer-accounts-page';
import { ListsPage } from '../../features/administration-panel/lists/lists-page';
import { ServiceSettingsPage } from '../../features/administration-panel/service-settings/service-settings-page';
import { ServiceSwitchesPage } from '../../features/administration-panel/service-switches/service-switches-page';
import { NotificationsPage } from '../../features/administration-panel/notifications/notifications-page';
import { TextsPage } from '../../features/administration-panel/texts/texts-page';
import { BrandingPage } from '../../features/administration-panel/branding/branding-page';
import { SetupChecklistPage } from '../../features/administration-panel/setup-checklist/setup-checklist-page';
import { RolesPage } from '../../features/administration-panel/roles/roles-page';
import { UnitsPage } from '../../features/administration-panel/units/units-page';
import { SystemAdministratorsPage } from '../../features/administration-panel/system-administrators/system-administrators-page';
import { AdminStagePage } from '../pages/admin-stage-page';

/** Brief 25: the Administration panel's screens, each at its stage's path. */
export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { path: ':stageSlug', element: <AdminStagePage /> },
    {
      path: 'access-and-permissions/system-administrators',
      element: <SystemAdministratorsPage />,
    },
    {
      path: 'access-and-permissions/officer-accounts',
      element: <OfficerAccountsPage />,
    },
    {
      path: 'access-and-permissions/permissions-matrix',
      element: <PermissionsMatrixPage />,
    },
    { path: 'access-and-permissions/access-check', element: <AccessCheckPage /> },
    { path: 'organisation/units', element: <UnitsPage /> },
    { path: 'organisation/roles', element: <RolesPage /> },
    { path: 'organisation/lists', element: <ListsPage /> },
    { path: 'configuration/service-settings', element: <ServiceSettingsPage /> },
    { path: 'configuration/service-switches', element: <ServiceSwitchesPage /> },
    { path: 'configuration/notifications', element: <NotificationsPage /> },
    { path: 'configuration/texts', element: <TextsPage /> },
    { path: 'configuration/branding', element: <BrandingPage /> },
    { path: 'configuration/setup-checklist', element: <SetupChecklistPage /> },
  ],
};
