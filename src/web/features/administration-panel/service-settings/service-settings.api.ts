import type {
  ServiceSettingsView,
  SettingHistoryEntry,
} from '../../../../shared/administration-panel/service-settings';
import type { useApiRequest } from '../../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const PATH = '/api/administration-panel/service-settings';

export const fetchServiceSettings = (request: Request) => request<ServiceSettingsView>(PATH);

export const fetchSettingHistory = (request: Request, key: string) =>
  request<SettingHistoryEntry[]>(`${PATH}/${key}/history`);

export const setSetting = (request: Request, key: string, value: unknown, unitId?: string) =>
  request<undefined>(`${PATH}/${key}`, { method: 'PUT', body: { value, unitId } });

export const removeOverride = (request: Request, key: string, unitId: string) =>
  request<undefined>(`${PATH}/${key}/overrides/${unitId}`, { method: 'DELETE' });

export const restoreSetting = (request: Request, key: string, historyId: string) =>
  request<undefined>(`${PATH}/${key}/history/${historyId}/restore`, { method: 'POST' });
