import { Navigate, type RouteObject } from 'react-router';
import { CorrespondenceLayout } from './correspondence-layout';
import { LetterInPage } from './letter-in-page';
import { LetterOutPage } from './letter-out-page';
import { LettersInPage } from './letters-in-page';
import { LettersOutPage } from './letters-out-page';
import { RecordLetterPage } from './record-letter-page';
import { WriteLetterPage } from './write-letter-page';

/** Brief 23: Correspondence and letters' pages, for the selected unit. */
export const correspondenceAndLettersRoutes: RouteObject = {
  path: 'correspondence-and-letters',
  element: <CorrespondenceLayout />,
  children: [
    { index: true, element: <Navigate to="letters-out" replace /> },
    { path: 'letters-out', element: <LettersOutPage /> },
    { path: 'letters-out/new', element: <WriteLetterPage /> },
    { path: 'letters-out/:letterId', element: <LetterOutPage /> },
    { path: 'letters-in', element: <LettersInPage /> },
    { path: 'letters-in/new', element: <RecordLetterPage /> },
    { path: 'letters-in/:letterId', element: <LetterInPage /> },
  ],
};
