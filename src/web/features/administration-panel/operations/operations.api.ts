import type {
  AuditLogPage,
  AuditSearch,
} from '../../../../shared/administration-panel/audit-entry';
import type { FileHousekeeping } from '../../../../shared/administration-panel/file-housekeeping';
import type { SystemHealth } from '../../../../shared/administration-panel/system-health';

export const OPERATIONS = '/api/administration-panel';
/** Every operations query starts with this, so one change refreshes them all. */
export const OPERATIONS_KEY = ['administration-panel', 'operations'] as const;

export interface BackupRecord {
  key: string;
  size: number;
  takenAt: string;
}

export type { AuditLogPage, FileHousekeeping, SystemHealth };

/** The audit log search as a query string; empty values left out. */
export function auditQuery(search: AuditSearch, page?: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) if (value) params.set(key, String(value));
  if (page) params.set('page', String(page));
  return params.toString();
}
