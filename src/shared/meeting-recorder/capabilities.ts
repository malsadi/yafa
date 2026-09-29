import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// D-199: each unit sees only its own meetings; the General Council sees a
// branch's once their reports are filed (P2). D-200: the meeting's chair and
// secretary record the minutes and log the report with no capability.
// D-221: granted for the holder's own unit, or for all units (the owner's
// "main administrator" role); the service's own rules apply either way.
const OWN_OR_ALL_UNITS = [PermissionScope.OwnUnit, PermissionScope.AllUnits] as const;

/** Service 2, Meeting recorder (brief section 22). Granted in the permissions matrix. */
export const MEETING_RECORDER_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'meeting-recorder.meetings.read',
    label: 'See meetings',
    description:
      "See the unit's meetings, their attendees, agenda, minutes and report (22; D-199).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
  {
    capability: 'meeting-recorder.meetings.manage',
    label: 'Manage meetings',
    description:
      "Set up the unit's meetings — details, attendees, agenda — cancel them, and do all the chair and secretary do (22 A; D-200, D-202).",
    allowedScopes: OWN_OR_ALL_UNITS,
  },
];
