import { Navigate, type RouteObject } from 'react-router';
import { EquipmentPage } from './equipment-page';
import { FiledLettersPage } from './filed-letters-page';
import { LetterTemplatesPage } from './letter-templates-page';
import { LibraryLayout } from './library-layout';
import { ResourcesPage } from './resources-page';
import { VenuesPage } from './venues-page';

/** Brief 16: the Resources library's sections, for the selected unit. */
export const resourcesLibraryRoutes: RouteObject = {
  path: 'resources-library',
  element: <LibraryLayout />,
  children: [
    { index: true, element: <Navigate to="templates" replace /> },
    { path: 'templates', element: <ResourcesPage kind="template" /> },
    { path: 'guides', element: <ResourcesPage kind="guide" /> },
    { path: 'venues', element: <VenuesPage /> },
    { path: 'equipment', element: <EquipmentPage /> },
    { path: 'letter-templates', element: <LetterTemplatesPage /> },
    { path: 'letters-out', element: <FiledLettersPage direction="out" /> },
    { path: 'letters-in', element: <FiledLettersPage direction="in" /> },
  ],
};
