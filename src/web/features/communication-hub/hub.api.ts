import type { NoticeRecord, VoterChoices } from '../../../shared/communication-hub/notice-records';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

export const unitHubPath = (unitId: string) => `/api/communication-hub/units/${unitId}`;

export const fetchNotices = (request: Request, unitId: string) =>
  request<NoticeRecord[]>(`${unitHubPath(unitId)}/notices`);

export const fetchVoterChoices = (request: Request, unitId: string) =>
  request<VoterChoices>(`${unitHubPath(unitId)}/voter-choices`);
