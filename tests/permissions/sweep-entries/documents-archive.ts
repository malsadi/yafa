import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const READ = { kind: 'capability', capability: 'documents-archive.documents.read' } as const;
const UPLOAD = { kind: 'capability', capability: 'documents-archive.documents.upload' } as const;

/** Brief 7.4: the documents-archive routes, in the order the app registers them. */
export const DOCUMENTS_ARCHIVE_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: '/api/documents-archive/categories', access: READ },
  { method: 'GET', path: '/api/documents-archive/units', access: READ },
  { method: 'GET', path: '/api/documents-archive/documents', access: READ },
  { method: 'GET', path: '/api/documents-archive/documents/:documentId', access: READ },
  {
    method: 'GET',
    path: '/api/documents-archive/documents/:documentId/versions/:version/file',
    access: READ,
  },
  { method: 'POST', path: '/api/documents-archive/units/:unitId/uploads', access: UPLOAD },
  {
    method: 'PUT',
    path: '/api/documents-archive/units/:unitId/documents/:documentId',
    access: UPLOAD,
  },
  {
    method: 'POST',
    path: '/api/documents-archive/units/:unitId/documents/:documentId/versions/uploads',
    access: UPLOAD,
  },
  {
    method: 'PUT',
    path: '/api/documents-archive/units/:unitId/documents/:documentId/versions',
    access: UPLOAD,
  },
];
