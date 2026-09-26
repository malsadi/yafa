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
const MANAGE_RESOURCES = {
  kind: 'capability',
  capability: 'resources-library.resources.manage',
} as const;
const RESOURCES = '/api/resources-library/units/:unitId/resources';
const RESOURCE = `${RESOURCES}/:resourceId`;
const MANAGE_VENUES = {
  kind: 'capability',
  capability: 'resources-library.venues.manage',
} as const;
const VENUES = '/api/resources-library/units/:unitId/venues';
const VENUE = `${VENUES}/:venueId`;
const MANAGE_EQUIPMENT = {
  kind: 'capability',
  capability: 'resources-library.equipment.manage',
} as const;
const EQUIPMENT = '/api/resources-library/units/:unitId/equipment';
const ITEM = `${EQUIPMENT}/:equipmentId`;
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
  { method: 'GET', path: RESOURCES, access: READ },
  { method: 'PATCH', path: RESOURCE, access: MANAGE_RESOURCES },
  { method: 'POST', path: `${RESOURCE}/retire`, access: MANAGE_RESOURCES },
  { method: 'POST', path: `${RESOURCE}/restore`, access: MANAGE_RESOURCES },
  { method: 'POST', path: `${RESOURCES}/uploads`, access: MANAGE_RESOURCES },
  { method: 'PUT', path: RESOURCE, access: MANAGE_RESOURCES },
  { method: 'POST', path: `${RESOURCE}/file/uploads`, access: MANAGE_RESOURCES },
  { method: 'PUT', path: `${RESOURCE}/file`, access: MANAGE_RESOURCES },
  { method: 'GET', path: `${RESOURCE}/file`, access: READ },
  { method: 'GET', path: VENUES, access: READ },
  { method: 'POST', path: VENUES, access: MANAGE_VENUES },
  { method: 'PUT', path: VENUE, access: MANAGE_VENUES },
  { method: 'POST', path: `${VENUE}/notes`, access: MANAGE_VENUES },
  { method: 'POST', path: `${VENUE}/notes/:noteId/retire`, access: MANAGE_VENUES },
  { method: 'POST', path: `${VENUE}/retire`, access: MANAGE_VENUES },
  { method: 'POST', path: `${VENUE}/restore`, access: MANAGE_VENUES },
  { method: 'GET', path: EQUIPMENT, access: READ },
  { method: 'POST', path: EQUIPMENT, access: MANAGE_EQUIPMENT },
  { method: 'PUT', path: ITEM, access: MANAGE_EQUIPMENT },
  { method: 'POST', path: `${ITEM}/retire`, access: MANAGE_EQUIPMENT },
  { method: 'POST', path: `${ITEM}/restore`, access: MANAGE_EQUIPMENT },
  { method: 'POST', path: `${ITEM}/loans`, access: MANAGE_EQUIPMENT },
  { method: 'PUT', path: `${ITEM}/loans/:loanId`, access: MANAGE_EQUIPMENT },
  { method: 'POST', path: `${ITEM}/loans/:loanId/return`, access: MANAGE_EQUIPMENT },
];
