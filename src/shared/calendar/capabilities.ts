import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// Each works in the officer's own unit. D-150: reading the unit's calendar
// also opens the all-branches view; D-146: only the General Council adds
// dates for all branches.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 5, Calendar (brief section 19). Granted in the permissions matrix. */
export const CALENDAR_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'calendar.calendar.read',
    label: 'Read the calendar',
    description:
      "See the unit's calendar — meetings, events and community dates — and switch to all branches (19 B1 to B3; D-150).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'calendar.community-dates.manage',
    label: 'Manage community dates',
    description:
      "Add, change, retire and bring back the unit's community dates; the General Council's may be for all branches (19 A3; D-145 to D-147).",
    allowedScopes: OWN_UNIT,
  },
];
