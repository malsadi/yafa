import type { ServiceSlug } from '../core/services';

/**
 * Brief 25 D2 and D-217 (O-167): which service each recorded action belongs
 * to, by the part of its name before the first dot — for the audit log's
 * service filter. A structure test keeps every action the code records here.
 */
export const AUDIT_ACTION_SERVICES: Readonly<Record<string, ServiceSlug>> = {
  achievement: 'achievements-and-reports',
  'annual-report': 'achievements-and-reports',
  'archive-document': 'documents-archive',
  'calendar-feed': 'calendar',
  'community-date': 'calendar',
  'alert-choices': 'communication-hub',
  circular: 'communication-hub',
  discussion: 'communication-hub',
  'hub-message': 'communication-hub',
  notice: 'communication-hub',
  'notice-vote': 'communication-hub',
  request: 'communication-hub',
  election: 'committee-register',
  handover: 'committee-register',
  invitation: 'committee-register',
  officer: 'committee-register',
  person: 'committee-register',
  role: 'committee-register',
  'standard-roles': 'committee-register',
  term: 'committee-register',
  unit: 'committee-register',
  'letter-in': 'correspondence-and-letters',
  'letter-out': 'correspondence-and-letters',
  event: 'event-organiser',
  'event-template': 'event-organiser',
  meeting: 'meeting-recorder',
  equipment: 'resources-library',
  'letter-template': 'resources-library',
  loan: 'resources-library',
  resource: 'resources-library',
  venue: 'resources-library',
  'venue-note': 'resources-library',
  task: 'task-tracker',
  'treasury-account': 'treasury',
  'treasury-entry': 'treasury',
  'treasury-receipt': 'treasury',
  'treasury-statement': 'treasury',
  'treasury-year': 'treasury',
  account: 'administration-panel',
  'admin-text': 'administration-panel',
  backup: 'administration-panel',
  'data-import': 'administration-panel',
  list: 'administration-panel',
  'list-item': 'administration-panel',
  'maintenance-mode': 'administration-panel',
  'permissions-matrix': 'administration-panel',
  'privacy-notice': 'administration-panel',
  'role-designation': 'administration-panel',
  'service-switches': 'administration-panel',
  settings: 'administration-panel',
  'system-administrator': 'administration-panel',
  'system-health': 'administration-panel',
};

/**
 * O-167 and P22: the actions whose before and after values the audit log
 * shows — the Administration panel's own changes (configuration, access,
 * settings) and the units and standard roles managed on its screens.
 * Every other entry shows who, what, which record and when, never content.
 */
export function showsValues(action: string): boolean {
  const prefix = action.split('.')[0] ?? '';
  return (
    AUDIT_ACTION_SERVICES[prefix] === 'administration-panel' ||
    prefix === 'unit' ||
    prefix === 'standard-roles'
  );
}

/** The service an action belongs to, or null for one not listed. */
export function serviceOfAction(action: string): ServiceSlug | null {
  return AUDIT_ACTION_SERVICES[action.split('.')[0] ?? ''] ?? null;
}
