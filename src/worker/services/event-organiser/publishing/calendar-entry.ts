import type { EventSummary } from '../../../../shared/event-organiser/event-records';
import type { CalendarEntryInput } from '../../calendar';

/**
 * Brief 19 A2 and D-189: what the Calendar shows of the event — written
 * only by the Event organiser; an event over several days, on every day.
 */
export function calendarEntry(
  event: Pick<EventSummary, 'unitId' | 'id' | 'name' | 'firstDay' | 'startTime' | 'lastDay'>,
): CalendarEntryInput {
  return {
    unitId: event.unitId,
    kind: 'event',
    sourceRecordId: event.id,
    title: event.name,
    titleAr: null,
    date: event.firstDay,
    lastDate: event.lastDay !== null && event.lastDay > event.firstDay ? event.lastDay : null,
    startTime: event.startTime,
  };
}
