import type { ListItem } from '../../../shared/administration-panel/lists';
import type { ClashNotice } from '../../../shared/calendar/calendar-records';
import type { EventFileRecord } from '../../../shared/event-organiser/event-file-uses';
import type {
  EventSummary,
  EventTemplateRecord,
} from '../../../shared/event-organiser/event-records';
import type { PostEventReport } from '../../../shared/event-organiser/post-event-report';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import type { AccountHistory, EventBudgetFigures } from '../../../shared/treasury/treasury-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/event-organiser/units/${unitId}`;
export const eventPath = (unitId: string, eventId: string) =>
  `${unitPath(unitId)}/events/${eventId}`;

/** D-172: the event types to choose from, and the unit's officers who may lead. */
export interface EventChoices {
  types: Pick<ListItem, 'id' | 'nameEn' | 'nameAr'>[];
  leads: { personId: string; name: string }[];
  /** D-196: whether an event may move back a step; null while the setting is unset. */
  backwardsAllowed: boolean | null;
}

export interface EventTasksView {
  tasks: TaskRecord[];
  progress: { done: number; total: number; overdue: number };
}

export interface ClosePreview {
  balancePence: number;
  branchAccounts: { id: string; name: string }[];
}

export const fetchEvents = (request: Request, unitId: string) =>
  request<EventSummary[]>(`${unitPath(unitId)}/events`);
export const fetchEvent = (request: Request, unitId: string, eventId: string) =>
  request<EventSummary>(eventPath(unitId, eventId));
export const fetchEventChoices = (request: Request, unitId: string) =>
  request<EventChoices>(`${unitPath(unitId)}/event-choices`);
export const fetchTemplateChoices = (request: Request, unitId: string) =>
  request<EventTemplateRecord[]>(`${unitPath(unitId)}/template-choices`);
export const fetchTemplates = (request: Request, unitId: string) =>
  request<EventTemplateRecord[]>(`${unitPath(unitId)}/templates`);
export const fetchEventTasks = (request: Request, unitId: string, eventId: string) =>
  request<EventTasksView>(`${eventPath(unitId, eventId)}/tasks`);
export const fetchEventAccount = (request: Request, unitId: string, eventId: string) =>
  request<AccountHistory & { figures: EventBudgetFigures }>(
    `${eventPath(unitId, eventId)}/account`,
  );
export const fetchEventFiles = (request: Request, unitId: string, eventId: string) =>
  request<EventFileRecord[]>(`${eventPath(unitId, eventId)}/files`);
export const fetchReport = (request: Request, unitId: string, eventId: string) =>
  request<PostEventReport>(`${eventPath(unitId, eventId)}/report`);
export const fetchClosePreview = (request: Request, unitId: string, eventId: string) =>
  request<ClosePreview>(`${eventPath(unitId, eventId)}/close-preview`);

/** Brief 19 B4: the unit's meetings and events on the chosen days — a notice, never a block. */
export function fetchEventClashes(
  request: Request,
  unitId: string,
  params: { firstDay: string; lastDay: string; eventId?: string },
) {
  const query = new URLSearchParams({
    firstDay: params.firstDay,
    ...(params.lastDay ? { lastDay: params.lastDay } : {}),
    ...(params.eventId ? { eventId: params.eventId } : {}),
  });
  return request<ClashNotice[]>(`${unitPath(unitId)}/event-clashes?${query.toString()}`);
}
