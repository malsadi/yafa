/**
 * Brief 21: an event's status, by its exact name — Draft → Approved → In
 * preparation → Ready → Completed → Closed. D-181 adds Cancelled, reachable
 * from any status before Closed, and then closed in the usual way.
 */
export const EventStatus = {
  Draft: 'Draft',
  Approved: 'Approved',
  InPreparation: 'In preparation',
  Ready: 'Ready',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Closed: 'Closed',
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const EVENT_STATUSES: readonly EventStatus[] = Object.values(EventStatus);

/** D-180: the steps the lead officer moves the event along, one at a time, in order. */
export const EVENT_STEPS: readonly EventStatus[] = [
  EventStatus.Approved,
  EventStatus.InPreparation,
  EventStatus.Ready,
  EventStatus.Completed,
];

/** D-184 and D-181: the statuses an event is closed from. */
export const CLOSABLE_STATUSES: readonly EventStatus[] = [
  EventStatus.Completed,
  EventStatus.Cancelled,
];

/** Brief 21 F1, F2: the two sections event files are split into, and no others. */
export const EventFileSection = { Documents: 'Documents', Media: 'Media' } as const;

export type EventFileSection = (typeof EventFileSection)[keyof typeof EventFileSection];

export const EVENT_FILE_SECTIONS: readonly EventFileSection[] = Object.values(EventFileSection);
