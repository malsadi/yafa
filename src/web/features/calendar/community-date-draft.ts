import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { unitCalendarPath } from './calendar.api';

export interface CommunityDateDraft {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  description: string;
  forAllBranches: boolean;
}

/** A community date's form: blank for a new one, or the date as it stands. */
export function draftOf(date?: CalendarItem): CommunityDateDraft {
  return {
    title: date?.title ?? '',
    startDate: date?.startDate ?? '',
    endDate: date && date.endDate !== date.startDate ? date.endDate : '',
    startTime: date?.startTime ?? '',
    description: date?.description ?? '',
    forAllBranches: date?.forAllBranches ?? false,
  };
}

/** D-145 and 9.1: the request the form makes — one day unless a last day is given; a change from the version read. */
export function saveRequest(unitId: string, draft: CommunityDateDraft, date?: CalendarItem) {
  const details = {
    title: draft.title,
    startDate: draft.startDate,
    endDate: draft.endDate || draft.startDate,
    startTime: draft.startTime || null,
    description: draft.description,
    forAllBranches: draft.forAllBranches,
  };
  const base = `${unitCalendarPath(unitId)}/community-dates`;
  return date
    ? {
        path: `${base}/${date.id}`,
        method: 'PUT' as const,
        body: { version: date.version, date: details },
      }
    : { path: base, method: 'POST' as const, body: details };
}
