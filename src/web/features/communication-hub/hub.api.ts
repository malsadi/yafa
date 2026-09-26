import type {
  CircularBranch,
  OpenedCircular,
  ReceivedCircular,
  SentCircular,
} from '../../../shared/communication-hub/circular-records';
import type { NoticeRecord, VoterChoices } from '../../../shared/communication-hub/notice-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitHubPath = (unitId: string) => `/api/communication-hub/units/${unitId}`;

export const fetchNotices = (request: Request, unitId: string) =>
  request<NoticeRecord[]>(`${unitHubPath(unitId)}/notices`);

export const fetchVoterChoices = (request: Request, unitId: string) =>
  request<VoterChoices>(`${unitHubPath(unitId)}/voter-choices`);

export const fetchReceivedCirculars = (request: Request, unitId: string) =>
  request<ReceivedCircular[]>(`${unitHubPath(unitId)}/circulars`);

/** Brief 20 A4 and P14: opening a circular records the branch's first opening. */
export const openCircular = (request: Request, unitId: string, circularId: string) =>
  request<OpenedCircular>(`${unitHubPath(unitId)}/circulars/${circularId}`);

export const fetchSentCirculars = (request: Request, unitId: string) =>
  request<SentCircular[]>(`${unitHubPath(unitId)}/sent-circulars`);

export const fetchCircularBranches = (request: Request, unitId: string) =>
  request<CircularBranch[]>(`${unitHubPath(unitId)}/circular-branches`);
