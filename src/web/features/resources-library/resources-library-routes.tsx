import { Navigate, type RouteObject } from 'react-router';
import { FiledLettersPage } from './filed-letters-page';
import { LetterTemplatesPage } from './letter-templates-page';
import { LibraryLayout } from './library-layout';

/** Brief 16: the Resources library's sections, for the selected unit. */
export const resourcesLibraryRoutes: RouteObject = {
  path: 'resources-library',
  element: <LibraryLayout />,
  children: [
    { index: true, element: <Navigate to="letter-templates" replace /> },
    { path: 'letter-templates', element: <LetterTemplatesPage /> },
    { path: 'letters-out', element: <FiledLettersPage direction="out" /> },
    { path: 'letters-in', element: <FiledLettersPage direction="in" /> },
  ],
};
