import { Navigate, type RouteObject } from 'react-router';
import { ActionListPage } from './action-list-page';
import { MyTasksPage } from './my-tasks-page';
import { TaskTrackerLayout } from './task-tracker-layout';

/** Brief 18: My tasks, and the selected unit's action list. */
export const taskTrackerRoutes: RouteObject = {
  path: 'task-tracker',
  element: <TaskTrackerLayout />,
  children: [
    { index: true, element: <Navigate to="mine" replace /> },
    { path: 'mine', element: <MyTasksPage /> },
    { path: 'action-list', element: <ActionListPage /> },
  ],
};
