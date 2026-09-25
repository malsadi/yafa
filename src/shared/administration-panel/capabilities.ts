import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

const PORTAL_WIDE = [PermissionScope.AllUnits] as const;

/**
 * Service 15, Administration panel, Phase 1 screens (brief section 25 A,
 * B2 designations, B3, C6). System administrators hold every one of these
 * (D-046); the matrix can grant them to anyone else. Units and the standard
 * roles are the national register officer's powers (brief 25 rules), so
 * those screens use the Committee register's fixed capabilities.
 */
export const ADMINISTRATION_PANEL_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'administration-panel.system-administrators.manage',
    label: 'Appoint and remove system administrators',
    description:
      'Appoint and remove system administrators (25 A1). At least two always remain (P21).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.officer-accounts.manage',
    label: 'Manage officer accounts',
    description:
      "See every person's access state; resend an invitation, lock or unlock, sign out of all sessions, revoke a calendar feed token, remove push devices (25 A2).",
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.permissions-matrix.manage',
    label: 'Edit the permissions matrix',
    description:
      'Grant capabilities to roles at a scope; every change versioned and restorable. Fixed rules shown locked (25 A3).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.access-check.read',
    label: 'Use the access check',
    description:
      'See exactly which capabilities and scopes an officer has: permissions only, never their data, no impersonation (25 A4).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.role-designations.manage',
    label: 'Designate the register officer roles',
    description:
      'Choose which role is the branch register officer role and which is the national register officer role (7.2, 25 B2).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.lists.manage',
    label: 'Manage lists',
    description:
      'Event types, meeting types, achievement categories, equipment conditions and handover checklist items (8.2, 25 B3).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.setup-checklist.manage',
    label: 'Set required settings from the set-up checklist',
    description:
      'Set a required setting that is not yet configured, from the set-up checklist (25 C6, D-074).',
    allowedScopes: PORTAL_WIDE,
  },
  {
    capability: 'administration-panel.setup-checklist.read',
    label: 'See the set-up checklist',
    description:
      'Every required setting, list and designation not yet configured, per service and unit (25 C6).',
    allowedScopes: PORTAL_WIDE,
  },
];
