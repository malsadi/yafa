import { Navigate, type RouteObject } from 'react-router';
import { CommunicationHubLayout } from './communication-hub-layout';
import { CircularsPage } from './circulars-page';
import { NoticeboardPage } from './noticeboard-page';

/** Brief 20: the Communication hub's sections. */
export const communicationHubRoutes: RouteObject = {
  path: 'communication-hub',
  element: <CommunicationHubLayout />,
  children: [
    { index: true, element: <Navigate to="noticeboard" replace /> },
    { path: 'noticeboard', element: <NoticeboardPage /> },
    { path: 'circulars', element: <CircularsPage /> },
  ],
};
