import type { CapabilityDefinition } from '../core/capability-definition';
import { PermissionScope } from '../core/permission-scope';

// D-173: each unit sees only its own events; the General Council sees a
// branch's once filed in the archive (P2). D-174: the lead officer moves
// their event's status with no capability; everything else is granted
// here. D-178: the General Council's templates are the national ones.
const OWN_UNIT = [PermissionScope.OwnUnit] as const;

/** Service 1, Event organiser (brief section 21). Granted in the permissions matrix. */
export const EVENT_ORGANISER_CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    capability: 'event-organiser.events.read',
    label: 'See events',
    description:
      "See the unit's events, their tasks, account, progress, files and post-event report (21; D-173).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'event-organiser.events.create',
    label: 'Create events',
    description:
      'Create an event, from a template or not, with its account and task list (21 A1, A3; D-172).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'event-organiser.events.approve',
    label: 'Approve events',
    description:
      "Record the committee's approval of an event and its budget; never one's own event (21 A4; D-175).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'event-organiser.events.manage',
    label: 'Manage events',
    description:
      "Change an event's details, budget, tasks, files and status, cancel it and publish it (21 A1, B1, B4, F; D-174).",
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'event-organiser.events.close',
    label: 'Close events',
    description:
      'Close a completed or cancelled event: settle its account, file it to the archive and lock it (21 C2; D-184).',
    allowedScopes: OWN_UNIT,
  },
  {
    capability: 'event-organiser.templates.manage',
    label: 'Manage event templates',
    description:
      "Add, change and retire the unit's event templates; the General Council's are national (21 A3; P15, D-178).",
    allowedScopes: OWN_UNIT,
  },
];
