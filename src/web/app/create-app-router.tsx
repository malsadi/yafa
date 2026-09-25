import { createBrowserRouter } from 'react-router';
import { AdminLayout } from './layouts/admin-layout';
import { PortalLayout } from './layouts/portal-layout';
import { PermissionsMatrixPage } from '../features/administration-panel/permissions-matrix/permissions-matrix-page';
import { SystemAdministratorsPage } from '../features/administration-panel/system-administrators/system-administrators-page';
import { AdminStagePage } from './pages/admin-stage-page';
import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';
import { PrivacyNoticeViewPage } from './pages/privacy-notice-view-page';
import { ServicePage } from './pages/service-page';
import { SessionShell } from './session/session-shell';

export function createAppRouter() {
  return createBrowserRouter([
    {
      element: <SessionShell />,
      children: [
        {
          path: '/admin',
          element: <AdminLayout />,
          children: [
            { path: ':stageSlug', element: <AdminStagePage /> },
            {
              path: 'access-and-permissions/system-administrators',
              element: <SystemAdministratorsPage />,
            },
            {
              path: 'access-and-permissions/permissions-matrix',
              element: <PermissionsMatrixPage />,
            },
          ],
        },
        {
          path: '/',
          element: <PortalLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'privacy-notice', element: <PrivacyNoticeViewPage /> },
            { path: ':serviceSlug', element: <ServicePage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ]);
}
