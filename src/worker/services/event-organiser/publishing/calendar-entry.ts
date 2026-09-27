import type { EventSummary } from '../../../../shared/event-organiser/event-records';

/** Brief 19 A2: what the Calendar shows of the event — written only by the Event organiser. */
export function calendarEntry(
  event: Pick<EventSummary, 'unitId' | 'id' | 'name' | 'firstDay' | 'startTime'>,
) {
  return {
    unitId: event.unitId,
    kind: 'event' as const,
    sourceRecordId: event.id,
    title: event.name,
    date: event.firstDay,
    startTime: event.startTime,
  };
}
