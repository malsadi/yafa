import type { RouteObject } from 'react-router';
import { ElectionPage } from './elections/election-page';
import { ElectionsPage } from './elections/elections-page';
import { HandoverPage } from './handovers/handover-page';
import { HandoversPage } from './handovers/handovers-page';
import { MyHandoversPage } from './handovers/my-handovers-page';
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
    { path: 'my-handovers', element: <MyHandoversPage /> },
    { path: 'handovers/:handoverId', element: <HandoverPage /> },
    {
      path: ':unitId',
      element: <RegisterLayout />,
      children: [
        { path: 'officers', element: <OfficersPage /> },
        { path: 'past-officers', element: <PastOfficersPage /> },
        { path: 'roles', element: <BranchRolesPage /> },
        { path: 'elections', element: <ElectionsPage /> },
        { path: 'elections/:electionId', element: <ElectionPage /> },
        { path: 'handovers', element: <HandoversPage /> },
      ],
    },
  ],
};
