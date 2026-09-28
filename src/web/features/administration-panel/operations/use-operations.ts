import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuditSearch } from '../../../../shared/administration-panel/audit-entry';
import { useApiRequest } from '../../../app/api/use-api-request';
import {
  auditQuery,
  OPERATIONS,
  OPERATIONS_KEY,
  type AuditLogPage,
  type BackupRecord,
  type FileHousekeeping,
  type SystemHealth,
} from './operations.api';

function useOperationsQuery<T>(part: string[], path: string) {
  const request = useApiRequest();
  return useQuery({ queryKey: [...OPERATIONS_KEY, ...part], queryFn: () => request<T>(path) });
}

export const useSystemHealth = () =>
  useOperationsQuery<SystemHealth>(['health'], `${OPERATIONS}/system-health`);
export const useBackups = () =>
  useOperationsQuery<BackupRecord[]>(['backups'], `${OPERATIONS}/backups`);
export const useFileHousekeeping = () =>
  useOperationsQuery<FileHousekeeping>(['files'], `${OPERATIONS}/file-housekeeping`);
export const useMaintenanceMode = () =>
  useOperationsQuery<{ enabled: boolean }>(['maintenance'], `${OPERATIONS}/maintenance-mode`);
export const useAuditLog = (search: AuditSearch, page: number) =>
  useOperationsQuery<AuditLogPage>(
    ['audit', auditQuery(search, page)],
    `${OPERATIONS}/audit-log?${auditQuery(search, page)}`,
  );

/** Any operations change; every operations view — and the session, for the banner — refreshes after. */
export function useOperationsAction<T = unknown>() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: { path: string; method: 'POST' | 'PUT'; body?: object }) =>
      request<T>(`${OPERATIONS}${p.path}`, { method: p.method, body: p.body ?? {} }),
    onSettled: () => queryClient.invalidateQueries(),
  });
}
