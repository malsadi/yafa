import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

const PORTAL_WIDE = [PermissionScope.AllUnits] as const;

/**
 * Service 15, Administration panel, Stage D (brief 25 D1 to D6; D-217).
 * System administrators hold every one of these (D-046); the matrix can
 * grant them to anyone else. None gives access to content (P22).
 */
export const OPERATIONS_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'administration-panel.system-health.manage',
    label: 'Check system health',
    description:
      'See every scheduled job’s last run and outcome, phone alerts not delivered and storage used per unit, and run a failed job again (25 D1; D-217).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.audit-log.read',
    label: 'Read the audit log',
    description:
      'Search every recorded action and export it as CSV. Before and after values show only for the Administration panel’s own changes (25 D2; P22; D-217).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.backups.manage',
    label: 'Manage backups',
    description: 'See the backups and run a backup now. There is no restore button (25 D3; D-217).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.data-import.run',
    label: 'Import data',
    description:
      'Import units, people with their terms, and branch accounts from CSV — a dry run first; no opening balances and no invitations (25 D4; D-217).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.file-housekeeping.read',
    label: 'Review file housekeeping',
    description: 'See storage used and files kept with no record (25 D5).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.maintenance-mode.manage',
    label: 'Switch maintenance mode',
    description: 'Put the portal into read-only mode with a banner, and take it out again (25 D6).',
    allowedScopes: PORTAL_WIDE,
  },
];
