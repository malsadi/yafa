import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const UNIT = '/api/achievements-and-reports/units/:unitId';
const ONE = `${UNIT}/achievements/:achievementId`;
const PHOTOS = `${ONE}/photos`;
const REPORTS = `${UNIT}/annual-reports`;
const READ = {
  kind: 'capability',
  capability: 'achievements-and-reports.achievements.read',
} as const;
const RECORD = {
  kind: 'capability',
  capability: 'achievements-and-reports.achievements.record',
} as const;
const MANAGE = {
  kind: 'capability',
  capability: 'achievements-and-reports.annual-report.manage',
} as const;

/** Brief 7.4: Achievements and reports' signed-in routes, in the order the app registers them. */
export const ACHIEVEMENTS_AND_REPORTS_SWEEP_ENTRIES: RouteDeclaration[] = [
  { method: 'GET', path: `${UNIT}/achievements`, access: READ },
  { method: 'GET', path: `${UNIT}/achievement-choices`, access: RECORD },
  { method: 'POST', path: `${UNIT}/achievements`, access: RECORD },
  { method: 'PUT', path: ONE, access: RECORD },
  { method: 'POST', path: `${ONE}/withdraw`, access: RECORD },
  { method: 'POST', path: `${ONE}/restore`, access: RECORD },
  { method: 'POST', path: `${PHOTOS}/uploads`, access: RECORD },
  { method: 'PUT', path: PHOTOS, access: RECORD },
  { method: 'POST', path: `${PHOTOS}/:fileId/remove`, access: RECORD },
  { method: 'GET', path: `${PHOTOS}/:fileId/file`, access: READ },
  { method: 'GET', path: `${UNIT}/contributions`, access: READ },
  { method: 'GET', path: `${UNIT}/contributions/:personId`, access: READ },
  { method: 'GET', path: REPORTS, access: READ },
  { method: 'POST', path: REPORTS, access: MANAGE },
  { method: 'GET', path: `${REPORTS}/:reportId`, access: READ },
  { method: 'PUT', path: `${REPORTS}/:reportId/summary`, access: MANAGE },
  { method: 'POST', path: `${REPORTS}/:reportId/finalise`, access: MANAGE },
  { method: 'GET', path: `${REPORTS}/:reportId/file`, access: READ },
];
