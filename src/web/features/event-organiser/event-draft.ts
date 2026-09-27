import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { eventPath, unitPath } from './event-organiser.api';

/** Brief 21 A1 and D-172: an event's form, as typed. */
export interface EventDraft {
  name: string;
  typeItemId: string;
  leadPersonId: string;
  firstDay: string;
  startTime: string;
  lastDay: string;
}

/** A new event's form, blank; or the event as it stands. */
export function eventDraftOf(event?: EventSummary): EventDraft {
  return {
    name: event?.name ?? '',
    typeItemId: event?.typeItemId ?? '',
    leadPersonId: event?.leadPersonId ?? '',
    firstDay: event?.firstDay ?? '',
    startTime: event?.startTime ?? '',
    lastDay: event?.lastDay ?? '',
  };
}

/** The details as the portal takes them: an empty time or last day is none. */
export function eventBodyOf(draft: EventDraft) {
  return {
    name: draft.name,
    typeItemId: draft.typeItemId,
    leadPersonId: draft.leadPersonId,
    firstDay: draft.firstDay,
    startTime: draft.startTime === '' ? null : draft.startTime,
    lastDay: draft.lastDay === '' ? null : draft.lastDay,
  };
}

/** Brief 21 A1, A3: a new event, from a template or not. */
export function createRequest(unitId: string, draft: EventDraft, templateId: string) {
  return {
    path: `${unitPath(unitId)}/events`,
    method: 'POST' as const,
    body: { event: eventBodyOf(draft), templateId: templateId === '' ? null : templateId },
  };
}

/** D-176 and 9.1: a change to the details, from the version read. */
export function changeRequest(event: EventSummary, draft: EventDraft) {
  return {
    path: eventPath(event.unitId, event.id),
    method: 'PUT' as const,
    body: { event: eventBodyOf(draft), version: event.version },
  };
}
