import type { RouteObject } from 'react-router';
import { OfficersPage } from './officers/officers-page';
import { PastOfficersPage } from './past-officers/past-officers-page';
import { BranchRolesPage } from './roles/branch-roles-page';
import { RegisterHomePage } from './register-home-page';
import { RegisterLayout } from './register-layout';

/** Brief 14: the Committee register's pages, one unit's register at a time. */
export const committeeRegisterRoutes: RouteObject = {
  path: 'committee-register',
  children: [
    { index: true, element: <RegisterHomePage /> },
    {
      path: ':unitId',
      element: <RegisterLayout />,
      children: [
        { path: 'officers', element: <OfficersPage /> },
        { path: 'past-officers', element: <PastOfficersPage /> },
        { path: 'roles', element: <BranchRolesPage /> },
      ],
    },
  ],
};
