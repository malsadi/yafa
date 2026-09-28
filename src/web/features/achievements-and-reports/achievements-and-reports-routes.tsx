import { Navigate, type RouteObject } from 'react-router';
import { AchievementFormPage } from './achievement-form-page';
import { AchievementsLayout } from './achievements-layout';
import { AnnualReportPage } from './annual-report-page';
import { AnnualReportsPage } from './annual-reports-page';
import { ContributionPage } from './contribution-page';
import { ContributionsPage } from './contributions-page';
import { TimelinePage } from './timeline-page';

/** Brief 24: Achievements and reports' pages, for the selected unit. */
export const achievementsAndReportsRoutes: RouteObject = {
  path: 'achievements-and-reports',
  element: <AchievementsLayout />,
  children: [
    { index: true, element: <Navigate to="timeline" replace /> },
    { path: 'timeline', element: <TimelinePage /> },
    { path: 'achievements/new', element: <AchievementFormPage /> },
    { path: 'achievements/:achievementId/change', element: <AchievementFormPage /> },
    { path: 'contributions', element: <ContributionsPage /> },
    { path: 'contributions/:personId', element: <ContributionPage /> },
    { path: 'annual-reports', element: <AnnualReportsPage /> },
    { path: 'annual-reports/:reportId', element: <AnnualReportPage /> },
  ],
};
