/**
 * The stage-one services (brief section 3.1's table), in that order. This
 * list is fixed by what's been built, not something the data administrator
 * configures — the administrator can only switch an existing service on or
 * off (brief section 8.4), never add or remove one.
 */
export const SERVICES = [
  { number: 1, slug: 'event-organiser', name: 'Event organiser' },
  { number: 2, slug: 'meeting-recorder', name: 'Meeting recorder' },
  { number: 3, slug: 'treasury', name: 'Treasury' },
  { number: 4, slug: 'communication-hub', name: 'Communication hub' },
  { number: 5, slug: 'calendar', name: 'Calendar' },
  { number: 6, slug: 'resources-library', name: 'Resources library' },
  { number: 7, slug: 'correspondence-and-letters', name: 'Correspondence and letters' },
  { number: 8, slug: 'committee-register', name: 'Committee register' },
  { number: 9, slug: 'task-tracker', name: 'Task tracker' },
  { number: 12, slug: 'achievements-and-reports', name: 'Achievements and reports' },
  { number: 13, slug: 'documents-archive', name: 'Documents archive' },
  { number: 15, slug: 'administration-panel', name: 'Administration panel' },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]['slug'];

/** Brief section 8.4: these three can never be switched off. */
export const SERVICES_THAT_CANNOT_BE_SWITCHED_OFF: readonly ServiceSlug[] = [
  'committee-register',
  'documents-archive',
  'administration-panel',
];
