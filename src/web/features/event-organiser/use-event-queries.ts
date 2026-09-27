import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import {
  fetchClosePreview,
  fetchEvent,
  fetchEventAccount,
  fetchEventChoices,
  fetchEventFiles,
  fetchEvents,
  fetchEventTasks,
  fetchReport,
  fetchTemplateChoices,
  fetchTemplates,
} from './event-organiser.api';
import { EVENTS_KEY } from './event-keys';

type Fetch<T> = (request: ReturnType<typeof useApiRequest>) => Promise<T>;

/** One Event organiser query for the unit, refreshed with every change (EVENTS_KEY). */
function useEventQuery<T>(key: readonly string[], fetch: Fetch<T>, enabled = true) {
  const request = useApiRequest();
  return useQuery({ queryKey: [...EVENTS_KEY, ...key], queryFn: () => fetch(request), enabled });
}

export const useEvents = (unitId: string) =>
  useEventQuery([unitId, 'list'], (r) => fetchEvents(r, unitId));
export const useEvent = (unitId: string, eventId: string) =>
  useEventQuery([unitId, eventId], (r) => fetchEvent(r, unitId, eventId));
export const useEventChoices = (unitId: string) =>
  useEventQuery([unitId, 'choices'], (r) => fetchEventChoices(r, unitId));
export const useTemplateChoices = (unitId: string, enabled: boolean) =>
  useEventQuery([unitId, 'template-choices'], (r) => fetchTemplateChoices(r, unitId), enabled);
export const useTemplates = (unitId: string) =>
  useEventQuery([unitId, 'templates'], (r) => fetchTemplates(r, unitId));
export const useEventTasks = (unitId: string, eventId: string) =>
  useEventQuery([unitId, eventId, 'tasks'], (r) => fetchEventTasks(r, unitId, eventId));
export const useEventAccount = (unitId: string, eventId: string) =>
  useEventQuery([unitId, eventId, 'account'], (r) => fetchEventAccount(r, unitId, eventId));
export const useEventFiles = (unitId: string, eventId: string) =>
  useEventQuery([unitId, eventId, 'files'], (r) => fetchEventFiles(r, unitId, eventId));
export const useEventReport = (unitId: string, eventId: string, enabled: boolean) =>
  useEventQuery([unitId, eventId, 'report'], (r) => fetchReport(r, unitId, eventId), enabled);
export const useClosePreview = (unitId: string, eventId: string, enabled: boolean) =>
  useEventQuery([unitId, eventId, 'close'], (r) => fetchClosePreview(r, unitId, eventId), enabled);
