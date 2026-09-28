import type { RouteDeclaration } from '../../../src/worker/core/permissions';

const P = '/api/administration-panel';
const cap = (capability: string) => ({ kind: 'capability', capability }) as const;

/** Brief 25 Stage D (D-217): the operations screens' routes, in the order the app registers them. */
export const OPERATIONS_SWEEP_ENTRIES: RouteDeclaration[] = [
  {
    method: 'GET',
    path: `${P}/system-health`,
    access: cap('administration-panel.system-health.manage'),
  },
  {
    method: 'POST',
    path: `${P}/system-health/jobs/:jobName/run`,
    access: cap('administration-panel.system-health.manage'),
  },
  { method: 'GET', path: `${P}/audit-log`, access: cap('administration-panel.audit-log.read') },
  { method: 'GET', path: `${P}/audit-log.csv`, access: cap('administration-panel.audit-log.read') },
  { method: 'GET', path: `${P}/backups`, access: cap('administration-panel.backups.manage') },
  { method: 'POST', path: `${P}/backups`, access: cap('administration-panel.backups.manage') },
  {
    method: 'GET',
    path: `${P}/file-housekeeping`,
    access: cap('administration-panel.file-housekeeping.read'),
  },
  {
    method: 'GET',
    path: `${P}/maintenance-mode`,
    access: cap('administration-panel.maintenance-mode.manage'),
  },
  {
    method: 'PUT',
    path: `${P}/maintenance-mode`,
    access: cap('administration-panel.maintenance-mode.manage'),
  },
  {
    method: 'POST',
    path: `${P}/data-import/dry-run`,
    access: cap('administration-panel.data-import.run'),
  },
  { method: 'POST', path: `${P}/data-import`, access: cap('administration-panel.data-import.run') },
];
