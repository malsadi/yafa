import type { RouteObject } from 'react-router';
import { AuditLogPage } from '../../features/administration-panel/operations/audit-log-page';
import { BackupsPage } from '../../features/administration-panel/operations/backups-page';
import { DataImportPage } from '../../features/administration-panel/operations/data-import-page';
import { FileHousekeepingPage } from '../../features/administration-panel/operations/file-housekeeping-page';
import { MaintenanceModePage } from '../../features/administration-panel/operations/maintenance-mode-page';
import { SystemHealthPage } from '../../features/administration-panel/operations/system-health-page';

/** Brief 25 Stage D: the operations screens (D1 to D6). */
export const operationsRoutes: RouteObject[] = [
  { path: 'operations/system-health', element: <SystemHealthPage /> },
  { path: 'operations/audit-log', element: <AuditLogPage /> },
  { path: 'operations/backups', element: <BackupsPage /> },
  { path: 'operations/data-import', element: <DataImportPage /> },
  { path: 'operations/file-housekeeping', element: <FileHousekeepingPage /> },
  { path: 'operations/maintenance-mode', element: <MaintenanceModePage /> },
];
