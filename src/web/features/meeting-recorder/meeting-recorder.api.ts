import type { ListItem } from '../../../shared/administration-panel/lists';
import type {
  MeetingDetail,
  MeetingSummary,
} from '../../../shared/meeting-recorder/meeting-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitPath = (unitId: string) => `/api/meeting-recorder/units/${unitId}`;
export const meetingPath = (unitId: string, meetingId: string) =>
  `${unitPath(unitId)}/meetings/${meetingId}`;

/** D-198 and D-207: the meeting types, the unit's officers, and how often the minutes save themselves. */
export interface MeetingChoices {
  types: Pick<ListItem, 'id' | 'nameEn' | 'nameAr'>[];
  officers: { personId: string; name: string }[];
  autosaveSeconds: number | null;
}

export const fetchMeetings = (request: Request, unitId: string) =>
  request<MeetingSummary[]>(`${unitPath(unitId)}/meetings`);
export const fetchMeeting = (request: Request, unitId: string, meetingId: string) =>
  request<MeetingDetail>(meetingPath(unitId, meetingId));
export const fetchMeetingChoices = (request: Request, unitId: string) =>
  request<MeetingChoices>(`${unitPath(unitId)}/meeting-choices`);
