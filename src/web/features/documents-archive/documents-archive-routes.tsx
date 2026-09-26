import type { RouteObject } from 'react-router';
import { ArchivePage } from './archive-page';
import { DocumentPage } from './document-page';

/** Brief 15: the Documents archive's pages. It is never switched off (8.4). */
export const documentsArchiveRoutes: RouteObject = {
  path: 'documents-archive',
  children: [
    { index: true, element: <ArchivePage /> },
    { path: ':documentId', element: <DocumentPage /> },
  ],
};
