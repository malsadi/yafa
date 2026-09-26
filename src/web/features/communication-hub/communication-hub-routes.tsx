import { Navigate, type RouteObject } from 'react-router';
import { CommunicationHubLayout } from './communication-hub-layout';
import { CircularsPage } from './circulars-page';
import { DiscussionsPage } from './discussions-page';
import { NoticeboardPage } from './noticeboard-page';
import { RequestsPage } from './requests-page';
import { RoleNetworksPage } from './role-networks-page';

/** Brief 20: the Communication hub's sections. */
export const communicationHubRoutes: RouteObject = {
  path: 'communication-hub',
  element: <CommunicationHubLayout />,
  children: [
    { index: true, element: <Navigate to="noticeboard" replace /> },
    { path: 'noticeboard', element: <NoticeboardPage /> },
    { path: 'circulars', element: <CircularsPage /> },
    { path: 'role-networks', element: <RoleNetworksPage /> },
    { path: 'discussions', element: <DiscussionsPage /> },
    { path: 'requests', element: <RequestsPage /> },
  ],
};
