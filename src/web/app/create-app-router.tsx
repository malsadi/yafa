import { createBrowserRouter } from 'react-router';
import { AdminLayout } from './layouts/admin-layout';
import { PortalLayout } from './layouts/portal-layout';
import { AdminStagePage } from './pages/admin-stage-page';
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
          children: [{ path: ':stageSlug', element: <AdminStagePage /> }],
        },
        {
          path: '/',
          element: <PortalLayout />,
          children: [
            { path: 'privacy-notice', element: <PrivacyNoticeViewPage /> },
            { path: ':serviceSlug', element: <ServicePage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ]);
}
