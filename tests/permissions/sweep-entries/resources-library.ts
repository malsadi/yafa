import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const READ = { kind: 'capability', capability: 'resources-library.library.read' } as const;
const MANAGE_LETTERS = {
  kind: 'capability',
  capability: 'resources-library.letter-templates.manage',
} as const;
const CORRESPONDENCE = {
  kind: 'capability',
  capability: 'resources-library.correspondence.read',
} as const;
const TEMPLATES = '/api/resources-library/units/:unitId/letter-templates';
const LETTERS = '/api/resources-library/units/:unitId/letters/:direction';

/** Brief 7.4: the resources-library routes, in the order the app registers them. */
export const RESOURCES_LIBRARY_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: TEMPLATES, access: READ },
  { method: 'POST', path: TEMPLATES, access: MANAGE_LETTERS },
  { method: 'PUT', path: `${TEMPLATES}/:templateId`, access: MANAGE_LETTERS },
  { method: 'POST', path: `${TEMPLATES}/:templateId/retire`, access: MANAGE_LETTERS },
  { method: 'POST', path: `${TEMPLATES}/:templateId/restore`, access: MANAGE_LETTERS },
  { method: 'POST', path: `${TEMPLATES}/preview`, access: MANAGE_LETTERS },
  { method: 'GET', path: LETTERS, access: CORRESPONDENCE },
  { method: 'GET', path: `${LETTERS}/:letterId/file`, access: CORRESPONDENCE },
];
