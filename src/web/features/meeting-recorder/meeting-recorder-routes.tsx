import { Navigate, type RouteObject } from 'react-router';
import { MeetingPage } from './meeting-page';
import { MeetingRecorderLayout } from './meeting-recorder-layout';
import { MeetingsPage } from './meetings-page';
import { NewMeetingPage } from './new-meeting-page';

/** Brief 22: the Meeting recorder's pages, for the selected unit. */
export const meetingRecorderRoutes: RouteObject = {
  path: 'meeting-recorder',
  element: <MeetingRecorderLayout />,
  children: [
    { index: true, element: <Navigate to="meetings" replace /> },
    { path: 'meetings', element: <MeetingsPage /> },
    { path: 'meetings/new', element: <NewMeetingPage /> },
    { path: 'meetings/:meetingId', element: <MeetingPage /> },
  ],
};
