import { createBrowserRouter } from 'react-router';
import { PortalLayout } from './layouts/portal-layout';
import { HelpPage } from './pages/help-page';
import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';
import { PrivacyNoticeViewPage } from './pages/privacy-notice-view-page';
import { ServicePage } from './pages/service-page';
import { SessionShell } from './session/session-shell';
import { committeeRegisterRoutes } from '../features/committee-register/committee-register-routes';
import { documentsArchiveRoutes } from '../features/documents-archive/documents-archive-routes';
import { resourcesLibraryRoutes } from '../features/resources-library/resources-library-routes';
import { adminRoutes } from './admin/admin-routes';

export function createAppRouter() {
  return createBrowserRouter([
    {
      element: <SessionShell />,
      children: [
        adminRoutes,
        {
          path: '/',
          element: <PortalLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: 'privacy-notice', element: <PrivacyNoticeViewPage /> },
            { path: 'help', element: <HelpPage /> },
            committeeRegisterRoutes,
            documentsArchiveRoutes,
            resourcesLibraryRoutes,
            { path: ':serviceSlug', element: <ServicePage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ]);
}
