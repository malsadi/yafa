import { Navigate, type RouteObject } from 'react-router';
import { AccountPage } from './account-page';
import { AccountsPage } from './accounts-page';
import { ApprovalsPage } from './approvals-page';
import { TreasuryLayout } from './treasury-layout';
import { YearsPage } from './years-page';

/** Brief 17: the Treasury's pages, for the selected unit. */
export const treasuryRoutes: RouteObject = {
  path: 'treasury',
  element: <TreasuryLayout />,
  children: [
    { index: true, element: <Navigate to="accounts" replace /> },
    { path: 'accounts', element: <AccountsPage /> },
    { path: 'accounts/:accountId', element: <AccountPage /> },
    { path: 'approvals', element: <ApprovalsPage /> },
    { path: 'years', element: <YearsPage /> },
  ],
};
